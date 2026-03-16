---
layout: project
title: "Smart Bridge Interoperability Solution"
project_id: "smart-bridge"
permalink: /projects/smart-bridge/
description: "A hub-and-spoke interoperability solution connecting legacy health systems (UCS and GoTHOMIS) with modern FHIR-based ecosystems using OpenHIM as the central routing and transformation engine."
---

## Project Gallery

{% assign project_data = site.data.projects.projects[page.project_id] %}
{% include project-gallery.html gallery=project_data.gallery project_id=page.project_id %}

## Detailed Project Documentation

### Background & Context

Healthcare systems in Tanzania rely on multiple legacy information systems that were built independently over the years. UCS (Unified Community System) and GoTHOMIS (Government of Tanzania Health Operations Management Information System) each store critical health data in proprietary formats, making data exchange between them difficult and error-prone.

Smart Bridge was created to solve this interoperability gap by acting as a central hub that connects these legacy systems with modern FHIR-based ecosystems, enabling seamless and standards-compliant health data exchange.

### Problem Statement

Tanzania's healthcare infrastructure faces significant interoperability challenges:

- **Data Silos**: UCS and GoTHOMIS store patient data in incompatible proprietary formats
- **No Standard Protocol**: Legacy systems lack support for modern healthcare data standards like FHIR
- **Manual Data Transfer**: Health workers often resort to manual data re-entry across systems
- **Compliance Gaps**: No centralized audit trail for data exchanges between systems
- **Monitoring Blind Spots**: Limited visibility into the health and performance of data exchange operations

### Solution Approach

Smart Bridge addresses these challenges through a hub-and-spoke architecture:

1. **OpenHIM as Central Hub**: All data exchanges are routed through OpenHIM, providing centralized orchestration, logging, and error handling
2. **FHIR R4 as Canonical Format**: Data is transformed to and from FHIR R4, enabling interoperability with any FHIR-compliant system
3. **Custom Mediators**: System-specific mediators handle the unique protocols and data formats of UCS and GoTHOMIS
4. **Comprehensive Audit Logging**: Every data exchange is logged for compliance with healthcare data regulations
5. **Real-Time Monitoring**: Prometheus metrics provide operational visibility into transformation performance and system health

### Technical Architecture

#### Project Structure

The application is organized as a Maven multi-module project for clean separation of concerns:

```
smart-bridge-parent/
├── smart-bridge-core/           # Core data models and interfaces
├── smart-bridge-transformation/ # Data transformation services
├── smart-bridge-mediators/      # OpenHIM mediator services
└── smart-bridge-application/    # Main Spring Boot application
```

#### Module Details

**smart-bridge-core**
- UCS data models with nested classes for identifiers, demographics, clinical data, and metadata
- FHIR Resource Wrapper for managing FHIR R4 resources via HAPI FHIR
- Service interfaces defining contracts for transformation and mediation
- Audit logging infrastructure for compliance trails
- Micrometer-based monitoring configuration

**smart-bridge-transformation**
- Data transformation services converting between UCS and FHIR formats
- Field-level mapping with validation and error handling
- Support for complex nested data structures (patient identifiers, clinical observations, encounters)

**smart-bridge-mediators**
- OpenHIM mediator implementations for UCS and GoTHOMIS
- Request/response transformation and routing logic
- Error recovery and retry mechanisms

**smart-bridge-application**
- Main Spring Boot application wiring all modules together
- Configuration management with dev and prod profiles
- Actuator endpoints for health checks and metrics

### Key Features

#### Data Transformation
- **UCS to FHIR**: Maps UCS client records to FHIR Patient, Observation, and Encounter resources
- **FHIR to UCS**: Reverse transformation for bidirectional data flow
- **Validation**: Ensures all transformed data conforms to FHIR R4 specifications
- **Error Handling**: Graceful handling of incomplete or malformed source data

#### OpenHIM Integration
- **Centralized Routing**: All inter-system communication flows through OpenHIM
- **Transaction Logging**: Complete audit trail for every data exchange
- **Channel Configuration**: Dedicated channels for each connected system
- **Error Alerting**: Automated notifications for failed transactions

#### Monitoring & Observability
- **Health Endpoint**: `/smart-bridge/actuator/health` for system status
- **Prometheus Metrics**: `/smart-bridge/actuator/prometheus` for scraping
- **Custom Metrics**: Transformation duration, success/error counts, FHIR/UCS operation counts
- **Audit Metrics**: Compliance and security event tracking

#### Logging Infrastructure
- **Application Logs**: 30-day retention with file rotation
- **Audit Logs**: 365-day retention for compliance
- **Security Logs**: 365-day retention for security events
- **Console Output**: Development-friendly logging with debug levels

### Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | Java 17 | Application logic |
| Framework | Spring Boot 3.2.0 | Application framework |
| FHIR Library | HAPI FHIR 6.8.0 (R4) | FHIR resource handling |
| Interoperability | OpenHIM | Central routing and mediation |
| Logging | SLF4J + Logback | Structured logging |
| Monitoring | Micrometer + Prometheus | Metrics collection |
| Testing | JUnit 5 + jqwik | Unit and property-based testing |
| Build Tool | Maven | Multi-module build management |

### Configuration

The application supports multiple profiles for different environments:

- **dev**: Debug logging, relaxed validation, local service URLs
- **prod**: Optimized logging, strict validation, production endpoints

Key configuration includes OpenHIM core URL, FHIR server URL, UCS API URL, and toggles for metrics and audit logging.

### Development Setup

```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package application
mvn package

# Run application
mvn spring-boot:run -pl smart-bridge-application
```

### Testing Strategy

- **Unit Tests**: JUnit 5 for individual component testing
- **Property-Based Tests**: jqwik for testing transformation logic with generated data
- **Integration Tests**: End-to-end testing of transformation pipelines
- **Mediator Tests**: Validation of OpenHIM mediator request/response handling

### Challenges & Solutions

#### Challenge 1: Complex Legacy Data Models
**Problem**: UCS uses deeply nested proprietary data structures with identifiers, demographics, clinical data, and metadata organized differently than FHIR expects
**Solution**:
- Created detailed UCS data models with nested classes mirroring the legacy structure
- Built field-level mapping logic that handles optional fields, nested objects, and data type conversions
- Used HAPI FHIR's fluent API to construct validated FHIR resources from the mapped data

#### Challenge 2: Reliable Inter-System Communication
**Problem**: Multiple systems with different availability characteristics, network conditions, and failure modes
**Solution**:
- Deployed OpenHIM as the central mediator to handle routing, retry logic, and transaction logging
- Implemented custom mediators with circuit breaker patterns for each connected system
- Added comprehensive error handling with fallback strategies

#### Challenge 3: Healthcare Compliance and Auditability
**Problem**: All health data exchanges must be traceable and auditable for regulatory compliance
**Solution**:
- Designed multi-tier logging with separate audit and security log streams
- Configured 365-day retention for compliance-critical logs
- Exposed Prometheus metrics for real-time monitoring of all data exchange operations
- Integrated with OpenHIM's built-in transaction logging for end-to-end traceability

### Future Enhancements

- **GoTHOMIS Mediator**: Full mediator implementation for GoTHOMIS integration
- **Bidirectional Sync**: Real-time synchronization between UCS and FHIR systems
- **Dashboard**: Web-based monitoring dashboard for operational visibility
- **Additional FHIR Resources**: Support for Medication, Immunization, and DiagnosticReport resources
- **HL7v2 Support**: Bridge to systems using HL7v2 messaging
