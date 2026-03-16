---
layout: project
title: "Fast Chat AI - RAG Chatbot"
project_id: "fast-chat-ai"
permalink: /projects/fast-chat-ai/
description: "A full-stack Retrieval-Augmented Generation chatbot with multi-LLM support, vector search, and hybrid conversation memory for intelligent document-grounded conversations."
---

## Project Gallery

{% assign project_data = site.data.projects.projects[page.project_id] %}
{% include project-gallery.html gallery=project_data.gallery project_id=page.project_id %}

## Detailed Project Documentation

### Background & Context

Fast Chat AI is a Retrieval-Augmented Generation (RAG) chatbot application that lets users upload documents and have intelligent conversations grounded in their specific knowledge base. Rather than relying solely on an LLM's training data, every response is backed by semantic search across the user's uploaded documents, ensuring accuracy and relevance.

The project was built to explore the full RAG pipeline end-to-end: document processing, vector embeddings, semantic retrieval, and LLM-powered generation -- all wrapped in a production-ready full-stack application.

### Problem Statement

Large Language Models are powerful but suffer from key limitations when used in knowledge-intensive tasks:

- **Hallucination**: LLMs can generate plausible-sounding but incorrect information
- **Stale Knowledge**: Training data has a cutoff date and cannot include private documents
- **No Source Attribution**: Users cannot verify where information comes from
- **Cost Variability**: Different providers offer different price/quality tradeoffs
- **Context Limits**: Long conversations lose important earlier context

### Solution Approach

Fast Chat AI addresses these challenges through a comprehensive RAG architecture:

1. **Document-Grounded Responses**: Every answer is retrieved from the user's own uploaded documents via semantic search
2. **Multi-Provider LLM Support**: Automatic failover and cost-optimized routing across OpenAI, Anthropic, and Google AI
3. **Hybrid Conversation Memory**: Redis for fast short-term context, PostgreSQL for persistent long-term memory with auto-summarization
4. **Multi-Tenant Environments**: Isolated knowledge bases per user/project
5. **Role-Based Access Control**: Admin and chat user roles for secure multi-user deployment

### Technical Architecture

#### System Overview

The application follows a three-tier architecture:

**Backend (FastAPI + Python)**
- RESTful API with async request handling via FastAPI
- SQLAlchemy 2.0 with async PostgreSQL driver
- Alembic for database migrations
- LLM provider abstraction layer with failover logic

**Vector Store (PostgreSQL + pgvector)**
- Document embeddings stored alongside relational data
- Semantic similarity search using cosine distance
- Intelligent document chunking for optimal retrieval

**Frontend (React + TypeScript)**
- React 19 single-page application
- React Router v7 for client-side routing
- Tailwind CSS v4 for utility-first styling
- Vite 7 for fast development and optimized builds

#### Core Components

**Document Processing Pipeline**
- Supports PDF, TXT, DOCX, and Markdown file formats
- Intelligent chunking that respects document structure
- Embedding generation using provider APIs
- Metadata extraction for enhanced search filtering

**RAG Retrieval Engine**
- Vector similarity search via pgvector
- Configurable retrieval parameters (top-k, similarity threshold)
- Context window assembly from retrieved chunks
- Source attribution for every response

**LLM Provider Manager**
- Abstract interface supporting OpenAI, Anthropic, and Google AI
- Automatic failover when a provider is unavailable
- Cost-optimized provider selection based on query complexity
- Streaming response support for real-time output

**Conversation Memory System**
- Redis-backed short-term memory for active sessions
- PostgreSQL-backed long-term conversation history
- Auto-summarization to condense long conversations
- Context injection for maintaining coherent multi-turn dialogue

### Key Features

#### Document Management
- **Multi-Format Upload**: PDF, TXT, DOCX, and Markdown support
- **Intelligent Chunking**: Structure-aware splitting for better retrieval
- **Environment Isolation**: Separate knowledge bases per project or tenant
- **Real-Time Processing**: Documents available for querying immediately after upload

#### Conversation Interface
- **Streaming Responses**: Real-time token-by-token output display
- **Source Citations**: Every response links back to source document chunks
- **Conversation History**: Persistent chat history with search
- **Context Awareness**: Maintains understanding across multi-turn conversations

#### Multi-LLM Intelligence
- **Provider Selection**: Choose between OpenAI, Anthropic, or Google AI
- **Automatic Failover**: Seamless switching when a provider is unavailable
- **Cost Optimization**: Intelligent routing based on query complexity
- **Model Configuration**: Adjustable temperature, max tokens, and other parameters

#### Administration
- **Role-Based Access**: Admin and user roles with different permissions
- **Environment Management**: Create and manage isolated knowledge bases
- **Usage Monitoring**: Track token usage and costs across providers
- **User Management**: Multi-user support with secure authentication

### Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend Framework | FastAPI | Async REST API |
| Language | Python 3.11+ | Backend logic |
| Database | PostgreSQL 15 + pgvector | Data + vector storage |
| Cache | Redis 7 | Session memory + caching |
| ORM | SQLAlchemy 2.0 (async) | Database abstraction |
| Migrations | Alembic | Schema versioning |
| Frontend | React 19 + TypeScript | User interface |
| Styling | Tailwind CSS v4 | UI design |
| Build Tool | Vite 7 | Frontend bundling |
| Containerization | Docker Compose | Service orchestration |
| LLM Providers | OpenAI, Anthropic, Google AI | Language models |

### Development Setup

#### Backend
```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL and Redis
docker compose up -d

# Run database migrations
alembic upgrade head

# Start the server
make run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:5173
```

### Testing Strategy

The project includes comprehensive test coverage:

- **Unit Tests**: Individual component and service testing
- **Integration Tests**: API endpoint and database interaction testing
- **End-to-End Tests**: Full RAG pipeline validation
- **Provider Tests**: LLM provider failover and response quality testing

### Challenges & Solutions

#### Challenge 1: Retrieval Accuracy
**Problem**: Ensuring the RAG pipeline retrieves the most relevant document chunks for each query
**Solution**:
- Implemented intelligent chunking that respects document structure (headings, paragraphs, code blocks)
- Tuned embedding parameters and similarity thresholds through systematic evaluation
- Added metadata filtering to narrow search scope when context is available

#### Challenge 2: Multi-Provider LLM Management
**Problem**: Different LLM providers have different APIs, capabilities, pricing, and failure modes
**Solution**:
- Built an abstract provider interface that normalizes interactions across OpenAI, Anthropic, and Google AI
- Implemented automatic failover with configurable retry logic
- Added cost-based routing to optimize spend without sacrificing quality

#### Challenge 3: Conversation Memory at Scale
**Problem**: Long conversations exceed LLM context windows, causing loss of earlier context
**Solution**:
- Designed hybrid memory using Redis for fast access to recent messages and PostgreSQL for long-term persistence
- Implemented auto-summarization that condenses earlier conversation turns into compact summaries
- Injected relevant memory context into each prompt without exceeding token limits

### Future Enhancements

- **Advanced RAG Techniques**: Hypothetical Document Embeddings (HyDE), re-ranking, and query expansion
- **Evaluation Framework**: Automated RAG quality metrics (faithfulness, relevance, recall)
- **Collaborative Environments**: Shared knowledge bases with team-level permissions
- **Webhook Integrations**: Connect to Slack, Teams, and other messaging platforms
- **Fine-Tuned Models**: Custom model training on domain-specific document collections
