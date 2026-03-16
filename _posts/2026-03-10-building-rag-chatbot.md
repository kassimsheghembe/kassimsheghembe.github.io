---
layout: post
title: "Building a RAG Chatbot: Architecture Decisions and Trade-offs"
date: 2026-03-10
author: Kassim Sheghembe
tags: [AI, RAG, Python, Architecture]
description: "Key architecture decisions behind Fast Chat AI — a production RAG chatbot covering chunking strategies, vector storage, multi-LLM failover, and conversation memory."
---

Building Fast Chat AI -- a Retrieval-Augmented Generation chatbot -- forced me to make dozens of architecture decisions that don't have obvious right answers. Every RAG tutorial makes it look simple: chunk documents, embed them, retrieve, generate. In practice, each of those steps involves trade-offs that significantly impact quality, cost, and reliability. Here's what I learned.

## The Core Problem

I wanted users to upload their documents and have intelligent conversations grounded in that specific knowledge base. The key word is "grounded" -- responses must come from the user's documents, not from the LLM's training data. This is harder than it sounds, because LLMs are extremely good at generating plausible-sounding text that has nothing to do with your documents.

## Decision 1: Chunking Strategy

Documents need to be split into chunks before embedding. The naive approach is fixed-size chunks (e.g., 500 tokens each). This is simple but produces terrible results. A chunk boundary might land in the middle of a critical paragraph, splitting context that belongs together.

I implemented structure-aware chunking that respects document boundaries:

- **Headings** create natural chunk boundaries
- **Paragraphs** are kept whole when possible
- **Code blocks** are never split mid-block
- **Overlap** of 50 tokens between chunks ensures context continuity

The chunk size target is 400-600 tokens, but it flexes to respect structure. A 700-token section under a single heading stays together rather than being arbitrarily split.

The trade-off: structure-aware chunking requires parsing each document format differently. PDF parsing is particularly tricky -- heading detection relies on font size heuristics that don't always work. But the retrieval quality improvement justified the complexity.

## Decision 2: pgvector vs. Dedicated Vector Database

The trendy choice for vector storage is a dedicated vector database like Pinecone, Weaviate, or Qdrant. I chose PostgreSQL with pgvector instead. Here's why.

Fast Chat AI already uses PostgreSQL for relational data: users, conversations, environments, permissions. Adding pgvector means embeddings live alongside the data they relate to. A single transaction can create a document record, store its chunks, and index its embeddings. No distributed consistency problems.

Performance was a concern. pgvector's HNSW index handles similarity search well up to a few million vectors. For a multi-tenant chatbot where each environment has thousands to tens of thousands of chunks, this is more than sufficient.

The trade-off: if I needed to scale to billions of vectors or needed sub-millisecond search at massive scale, a dedicated vector database would win. But for this use case, operational simplicity beats theoretical performance.

```python
# pgvector similarity search in SQLAlchemy
from pgvector.sqlalchemy import Vector

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1536))
    document_id = Column(Integer, ForeignKey("documents.id"))

# Cosine similarity search
results = session.query(DocumentChunk)\
    .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))\
    .limit(5)\
    .all()
```

## Decision 3: Multi-LLM Provider Architecture

Depending on a single LLM provider is a reliability and cost risk. OpenAI has outages. Anthropic has rate limits. Google AI has different strengths. I built an abstraction layer that supports all three.

The provider interface is simple: every provider implements `generate(prompt, context, params)` and `stream(prompt, context, params)`. The router selects a provider based on:

1. **User preference**: If the user chose a specific provider, use it
2. **Availability**: If the preferred provider is down, fail over to the next
3. **Cost optimization**: For simple queries, use a cheaper model; for complex ones, use a more capable model

The failover logic was the hardest part. You need to detect provider failures quickly (timeout after 10 seconds) and retry transparently without losing the user's context. The streaming interface made this especially tricky -- you can't switch providers mid-stream, so failover happens before generation starts.

The trade-off: the abstraction layer adds complexity and means I can't use provider-specific features deeply. Anthropic's system prompts work differently from OpenAI's, and the abstraction normalizes these differences at the cost of some expressiveness.

## Decision 4: Conversation Memory Architecture

Long conversations are the enemy of LLM context windows. After 20-30 exchanges, you've used up most of your context budget on conversation history, leaving little room for retrieved document chunks.

I implemented a hybrid memory system:

- **Redis** stores the last 10 messages for fast access during active conversations
- **PostgreSQL** stores the full conversation history permanently
- **Auto-summarization** kicks in when the conversation exceeds 15 messages: older messages are summarized into a compact paragraph that captures key points and decisions

The injection strategy for each new prompt:

```
[System prompt]
[Conversation summary (if exists)]
[Last 5 messages from Redis]
[Retrieved document chunks (top 5)]
[Current user message]
```

This keeps the total prompt under 4000 tokens while maintaining conversational coherence. The summary captures earlier context ("The user asked about deployment strategies and we discussed Docker vs. Kubernetes"), while recent messages provide immediate context.

The trade-off: summarization is lossy. Details from early in the conversation may be compressed away. For most use cases this is fine -- users rarely reference something from 30 messages ago with exact precision. But it's a genuine limitation.

## Decision 5: Multi-Tenant Isolation

Users can create separate "environments" -- isolated knowledge bases for different projects or topics. This required careful data isolation:

- Each environment has its own set of documents and chunks
- Vector searches are scoped to the active environment
- Conversation history is per-environment
- Users can switch environments without cross-contamination

The implementation uses environment IDs as partition keys throughout the query layer. Every database query includes an environment filter. This is simpler than physical database separation and works well at the scale I'm targeting.

## What Surprised Me

**Retrieval quality matters more than generation quality.** Swapping from GPT-3.5 to GPT-4 made modest improvements. But improving chunking strategy and retrieval relevance made dramatic improvements. The LLM can only work with the context you give it -- garbage in, garbage out.

**Users don't read citations.** I built a careful source attribution system that links every response back to specific document chunks. In practice, users rarely click through. They trust the system or they don't. The citations matter more for debugging and quality assurance than for end-user consumption.

**Cost adds up fast.** Embedding all documents, storing vectors, and generating responses across three providers isn't cheap. The cost-optimization router was initially a nice-to-have that became essential once I saw the bills from development testing.

## Conclusion

Building a production RAG system is an exercise in navigating trade-offs. There's no perfect chunking strategy, no universally best vector store, no single LLM that wins on every dimension. The architecture decisions that matter most are the ones that match your specific constraints: your scale, your budget, your reliability requirements, and your users' expectations. For Fast Chat AI, that meant PostgreSQL over dedicated vector DBs, structure-aware chunking over fixed-size splits, and a multi-provider architecture that prioritizes reliability over provider-specific optimization.
