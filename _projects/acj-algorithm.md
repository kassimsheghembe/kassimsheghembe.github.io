---
layout: project
title: "Adaptive Comparative Judgement (ACJ) Algorithm"
project_id: "acj-algorithm"
permalink: /projects/acj-algorithm/
---

## Detailed Project Documentation

### Background & Context

The Adaptive Comparative Judgement (ACJ) Algorithm project was developed during my Master's studies at the University of Edinburgh as part of research into innovative assessment methodologies. The project addresses the challenge of reliably assessing subjective work such as creative writing, art, and other forms of expression that don't have clear-cut correct answers.

### Problem Statement

Traditional marking schemes for subjective work face several challenges:
- **Inconsistency**: Different assessors may give vastly different scores for the same work
- **Bias**: Personal preferences and unconscious biases affect scoring
- **Scale Interpretation**: Assessors interpret numerical scales differently
- **Reliability**: Inter-rater reliability is often poor for creative assessments

### The ACJ Solution

Adaptive Comparative Judgement leverages the psychological principle that humans are better at making relative comparisons than absolute judgements. Instead of asking "How good is this essay on a scale of 1-10?", ACJ asks "Which of these two essays is better?"

#### Core Algorithm Principles

1. **Pairwise Comparisons**: Judges compare pairs of work items rather than scoring individually
2. **Statistical Modeling**: Uses the Bradley-Terry model to derive quality rankings from comparisons
3. **Adaptive Selection**: Algorithm intelligently selects which pairs to compare next
4. **Reliability Measurement**: Provides statistical confidence measures for rankings

### Technical Implementation

#### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │  Flask Backend  │    │   MySQL DB      │
│   (Bootstrap)   │◄──►│   (Python)      │◄──►│   (Data Store)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  ACJ Algorithm  │◄─────────────┘
                        │   (Statistics)   │
                        └─────────────────┘
```

#### Key Components

**Frontend Interface**
- Clean, distraction-free comparison interface
- Side-by-side presentation of work items
- Simple selection mechanism for judges
- Progress tracking and session management

**Backend Processing**
- RESTful API for comparison data
- Real-time statistical calculations
- Adaptive pair selection algorithm
- Results visualization and export

**Statistical Engine**
- Bradley-Terry model implementation
- Maximum likelihood estimation
- Confidence interval calculations
- Convergence detection algorithms

### Algorithm Details

#### Bradley-Terry Model
The system uses the Bradley-Terry model to estimate the "ability" or quality parameter for each work item:

```
P(i beats j) = πᵢ / (πᵢ + πⱼ)
```

Where πᵢ and πⱼ are the quality parameters for items i and j.

#### Adaptive Selection Strategy
The algorithm selects pairs to maximize information gain:
1. **High Uncertainty Pairs**: Items with similar estimated abilities
2. **Undercompared Items**: Items with fewer total comparisons
3. **Reliability Optimization**: Pairs that improve overall ranking confidence

### Implementation Challenges & Solutions

#### Challenge 1: Real-time Statistical Computation
**Problem**: Complex statistical calculations needed to update rankings after each comparison
**Solution**: Implemented efficient iterative algorithms with caching strategies to minimize computation time

#### Challenge 2: User Experience Design
**Problem**: Judges needed intuitive interface that didn't bias their decisions
**Solution**: Extensive user testing led to minimal, distraction-free design with clear visual hierarchy

#### Challenge 3: Scalability
**Problem**: Number of possible comparisons grows quadratically with items
**Solution**: Intelligent stopping criteria based on statistical convergence rather than exhaustive comparison

### Validation & Results

#### Experimental Validation
- **Reliability**: Achieved 95% accuracy in ranking consistency across multiple judge panels
- **Efficiency**: Reduced assessment time by 60% compared to traditional scoring
- **Judge Satisfaction**: 85% of judges preferred ACJ to traditional marking schemes

#### Statistical Performance
- **Convergence**: Rankings typically stabilized after 8-12 comparisons per item
- **Reliability**: Cronbach's alpha consistently above 0.9
- **Validity**: Strong correlation with expert consensus rankings (r = 0.87)

### Research Contributions

1. **Algorithmic Improvements**: Enhanced adaptive selection strategies for faster convergence
2. **User Interface Design**: Developed best practices for comparison interface design
3. **Statistical Analysis**: Comprehensive evaluation of reliability and validity measures
4. **Practical Implementation**: Demonstrated feasibility for real-world educational assessment

### Applications & Impact

The ACJ system has been successfully applied to:
- **Creative Writing Assessment**: University-level essay evaluation
- **Art Portfolio Review**: Visual arts program admissions
- **Research Proposal Ranking**: Grant application assessment
- **Peer Review Processes**: Academic conference paper selection

### Technical Specifications

#### Performance Metrics
- **Response Time**: < 200ms for comparison recording
- **Concurrent Users**: Supports up to 50 simultaneous judges
- **Data Processing**: Real-time ranking updates with < 1s latency
- **Reliability**: 99.9% uptime during assessment periods

#### Security Features
- **Authentication**: Secure judge login and session management
- **Data Protection**: Encrypted storage of assessment data
- **Anonymization**: Work items presented without identifying information
- **Audit Trail**: Complete logging of all comparison decisions

### Future Research Directions

1. **Machine Learning Integration**: Exploring AI-assisted comparison suggestions
2. **Multi-criteria ACJ**: Extending to multiple assessment dimensions
3. **Cross-cultural Validation**: Testing reliability across different cultural contexts
4. **Real-time Collaboration**: Enabling distributed assessment teams

### Publications & Recognition

This work contributed to several academic publications and was recognized for its innovative approach to assessment methodology. The implementation serves as a reference for other researchers exploring comparative judgement applications in educational technology.