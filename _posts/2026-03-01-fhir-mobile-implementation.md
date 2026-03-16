---
layout: post
title: "Implementing FHIR R4 on Android: Lessons from the Field"
date: 2026-03-01
author: Kassim Sheghembe
tags: [FHIR, Android, Healthcare, Mobile]
description: "Practical lessons from implementing FHIR R4 standards on Android using the AndroidFHIR SDK, including offline-first patterns and resource validation strategies."
---

Working on the NCD FHIR Healthcare Application taught me that implementing healthcare data standards on mobile is a fundamentally different challenge than doing it on a server. The constraints are real: intermittent connectivity, limited device storage, and healthcare workers who need things to just work. Here's what I learned building a FHIR R4 compliant Android app for Non-Communicable Disease screening in Tanzania.

## Why FHIR on Mobile Matters

Healthcare interoperability has long been a server-side concern. Systems like OpenHIM and HAPI FHIR handle data exchange between hospital information systems beautifully. But in many developing countries, the first point of data capture isn't a hospital -- it's a healthcare worker in the field with an Android phone.

If that phone app captures data in a proprietary format, you've just created another data silo. By implementing FHIR R4 directly on the device, every patient record, observation, and encounter is born as a standards-compliant resource. No transformation layer needed downstream.

## Setting Up the AndroidFHIR SDK

Google's AndroidFHIR SDK provides the building blocks: a local FHIR data store backed by SQLite, a sync engine, and a Structured Data Capture (SDC) library for rendering FHIR Questionnaires. Getting started is straightforward, but the real complexity lives in the details.

The SDK's `FhirEngine` API handles CRUD operations on FHIR resources locally. You create a Patient resource, save it, and it sits in the local SQLite database until sync happens. The API is clean and Kotlin-friendly:

```kotlin
val patient = Patient().apply {
    id = UUID.randomUUID().toString()
    addName().apply {
        family = "Mwangi"
        addGiven("James")
    }
    gender = Enumerations.AdministrativeGender.MALE
    birthDateElement = DateType(1985, 3, 15)
}
fhirEngine.create(patient)
```

Simple enough. But the first lesson came quickly.

## Lesson 1: Offline-First Is Not Optional

In rural Tanzania, cellular connectivity is unreliable at best. Our app had to function fully offline and sync when a connection became available. The AndroidFHIR SDK supports this through its sync mechanism, but we had to be deliberate about our approach.

The key insight was treating the local FHIR store as the source of truth, not a cache. Every operation writes locally first. Sync is an asynchronous process that reconciles with the server when connectivity allows. This meant designing our entire data flow around local-first patterns:

- Patient registration happens locally and queues for upload
- Screening questionnaires are pre-loaded during periodic sync windows
- Conflict resolution favors the most recent write with audit logging

We scheduled sync attempts during specific windows when healthcare workers typically have better connectivity -- early morning before fieldwork and evening when they return to facilities with Wi-Fi.

## Lesson 2: FHIR Questionnaires Save Months of Development

The FHIR Structured Data Capture specification lets you define forms as FHIR Questionnaire resources. The AndroidFHIR SDK renders these natively. This was a game-changer for our NCD screening workflows.

Instead of building custom Android UI for each screening form, we defined our diabetes and hypertension screening protocols as FHIR Questionnaires. The SDK renders them with appropriate input controls, validation, and skip logic. When a form is submitted, it produces a QuestionnaireResponse resource that's already FHIR-compliant.

The practical benefit: when our clinical team wanted to modify the screening protocol, we updated a Questionnaire resource instead of writing new Android code. The app downloaded the updated questionnaire at next sync, and healthcare workers immediately had the new workflow.

## Lesson 3: Resource Validation Must Happen at the Edge

Server-side FHIR validation is well-established. But waiting until sync to validate means healthcare workers might capture invalid data in the field and not know until hours later. We implemented validation directly on the device.

The AndroidFHIR SDK provides basic structural validation. We extended this with custom validation rules specific to our NCD screening use case:

- Blood pressure readings within physiologically plausible ranges
- Required fields based on the patient's risk profile
- Cross-field validation (e.g., gestational diabetes questions only for pregnant patients)

Validation errors surface immediately in the UI, giving the healthcare worker a chance to correct data while the patient is still present.

## Lesson 4: Think in Resources, Not Tables

Coming from a traditional Android development background with Room and SQLite, it's tempting to think of FHIR resources as rows in a database. They're not. A Patient resource is a rich document that can contain names, addresses, identifiers, contacts, and links to other resources.

The mental shift required is significant. Instead of designing a relational schema and mapping to FHIR later, we started every feature by asking: "Which FHIR resources does this involve?" A blood pressure screening involves a Patient, an Encounter, and one or more Observation resources. The relationships between them are expressed through FHIR references, not foreign keys.

## Performance Considerations

Running a FHIR engine on mid-range Android devices in Tanzania meant paying attention to performance. Some things we learned:

- **Lazy loading**: Don't load all resources into memory. Use the SDK's search API with pagination
- **Sync batching**: Syncing 500 resources individually is much slower than batching. We sync in batches of 50
- **Database size**: After six months of data collection, the local SQLite database grew to 200MB on some devices. We implemented an archival strategy that moves synced, older records to a compressed backup

## What I'd Do Differently

If I started this project again, I'd invest more upfront in automated testing of FHIR resource creation. We caught several subtle issues late -- like Observation resources missing required coding systems -- that automated validation tests would have caught immediately.

I'd also establish a FHIR Implementation Guide earlier in the project. Having a formal IG that documents which resources we use, which profiles we apply, and which extensions we define would have prevented several team miscommunications.

## Conclusion

Implementing FHIR R4 on Android is entirely feasible, and the AndroidFHIR SDK provides solid foundations. The key is embracing the offline-first reality, leveraging FHIR Questionnaires for rapid form development, validating at the edge, and thinking in resources rather than database tables. The payoff is immediate interoperability -- every piece of data your app captures can flow into the broader healthcare ecosystem without transformation.
