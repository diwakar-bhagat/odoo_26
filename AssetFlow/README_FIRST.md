# README_FIRST.md

> **Repository Bootloader**
>
> **Project:** AssetFlow ERP
>
> **Architecture:** Enterprise ERP (Inspired by Odoo Engineering Principles)
>
> **Status:** Architecture Locked
>
> **Version:** 1.0

---

# STOP

If you are an AI Coding Agent (Claude Code, Cursor, Gemini CLI, Codex, Copilot, etc.)

**DO NOT WRITE A SINGLE LINE OF CODE YET.**

This repository follows an **Architecture-First Development Process**.

Every implementation must be based on the repository architecture.

Never guess.

Never invent workflows.

Never skip documentation.

---

# Repository Vision

This repository is **NOT** a CRUD application.

This repository is building a **modular Enterprise Asset Management ERP**.

The project is designed specifically for the **AssetFlow Hackathon** while following enterprise engineering practices inspired by modern ERP systems such as Odoo.

We are **not cloning Odoo.**

We are adopting the engineering philosophy behind enterprise ERP systems:

- Modular Architecture
- Relational Database Design
- Workflow-driven Development
- Domain-driven Business Modules
- Clean APIs
- Auditability
- Scalability
- Maintainability

---

# Repository Mission

Build an enterprise-grade Asset Management ERP that demonstrates:

- Strong Software Architecture
- Excellent Database Design
- Business Workflow Understanding
- Clean UI/UX
- Modular Backend
- Proper Validation
- Reusable Components
- Production-Level Engineering

The objective is **not** to build the most features.

The objective is to build the **best engineered system.**

---

# Architecture Decision (LOCKED)

This repository **will NOT** be developed from scratch.

Instead, it is built by extracting the reusable ERP architecture from our existing CTA ERP platform and replacing the business domain.

Transformation:

```text
CTA Apparel ERP
        │
        ▼
Reusable ERP Core
        │
        ▼
AssetFlow ERP
```

The ERP engine remains.

Only the business domain changes.

---

# What We Keep

The following architectural components are reused because they are domain-independent.

- Modular Architecture
- Layered Backend
- PostgreSQL-first Design
- REST API Layer
- Repository Pattern
- Service Layer
- RBAC
- Dashboard Framework
- Notifications
- Activity Logs
- Audit Trail
- Analytics
- Enterprise Navigation
- Shared UI Components

---

# What Changes

Only business-specific modules are replaced.

Instead of

```
Orders

Production

Garments

Buyers

Inventory
```

we implement

```
Organization

Assets

Allocation

Booking

Maintenance

Audit

Reports
```

Architecture remains unchanged.

Business logic changes.

---

# Engineering Philosophy

We think like ERP engineers.

NOT page developers.

Every feature begins with:

```
Problem

↓

Business Workflow

↓

Domain Model

↓

Database

↓

API

↓

Business Logic

↓

Frontend

↓

Testing

↓

Documentation
```

Never reverse this order.

---

# Primary Goals

Every engineering decision should optimize for:

1. Correct Architecture
2. Database Design
3. Workflow Design
4. Code Quality
5. Scalability
6. Maintainability
7. User Experience

Speed is **never** more important than architecture.

---

# Non Goals

This project does NOT aim to:

- Copy Odoo
- Clone another ERP
- Build unnecessary AI features
- Build flashy UI with weak architecture
- Optimize only for hackathon demos

---

# Engineering Principles

Every implementation must satisfy:

✅ Clean Architecture

✅ SOLID Principles

✅ Domain Separation

✅ PostgreSQL-first Thinking

✅ RESTful APIs

✅ Reusable Services

✅ Validation

✅ Auditability

✅ Scalability

✅ Maintainability

✅ Security

✅ Testability

---

# AI Usage Policy

Artificial Intelligence is an engineering assistant.

It is NOT the engineer.

Every generated solution must be:

- Understood
- Reviewed
- Adapted
- Refactored
- Tested

Never copy generated code blindly.

---

# Repository Source of Truth

All engineering decisions originate from the following documents.

Read them in order.

```
00_README_FIRST.md

↓

01_PROJECT_OVERVIEW.md

↓

02_ENGINEERING_PRINCIPLES.md

↓

03_ARCHITECTURE.md

↓

04_ARCHITECTURE_MIND_MAP.md

↓

05_DOMAIN_MODEL.md

↓

06_DATABASE.md

↓

07_WORKFLOW_ENGINE.md

↓

08_API_CONTRACTS.md

↓

09_UI_CONTEXT.md

↓

10_TEAM_WORKFLOW.md

↓

11_GIT_WORKFLOW.md

↓

12_AI_WORKFLOW.md

↓

13_PROGRESS_TRACKER.md

↓

CLAUDE.md
```

Never skip documents.

---

# Repository Decision Hierarchy

When conflicts occur, follow this priority.

```
Problem Statement

↓

Engineering Principles

↓

Architecture

↓

Domain Model

↓

Database

↓

API Contracts

↓

Business Logic

↓

Frontend

↓

Documentation
```

Higher-level documents always override lower-level ones.

---

# Module Philosophy

Every module must be independent.

Example

```
Organization

Assets

Allocation

Booking

Maintenance

Audit

Reports

Notifications
```

Modules communicate through well-defined services and APIs.

Never tightly couple modules.

---

# ERP Principles

The repository follows enterprise ERP principles.

Every business object should support where applicable:

- Lifecycle States
- Ownership
- Activity History
- Audit Trail
- Notifications
- Permissions
- Relationships
- Attachments
- Search
- Filtering
- Reporting

---

# Database Philosophy

PostgreSQL is the source of truth.

The database is designed before the UI.

Every table must have:

- Primary Key
- Foreign Keys
- Constraints
- Indexes
- Validation Rules
- Relationships
- Audit Fields

Never design tables around screens.

Design tables around business entities.

---

# API Philosophy

APIs expose business capabilities.

Not database tables.

Bad

```
CreateAsset()

UpdateAsset()
```

Good

```
Allocate Asset

Transfer Asset

Approve Maintenance

Return Asset

Start Audit

Complete Audit
```

Endpoints represent business actions.

---

# UI Philosophy

UI exists to support workflows.

Not the other way around.

The interface should be

- Consistent
- Minimal
- Professional
- Responsive
- Accessible
- Enterprise Ready

We borrow the usability principles of mature ERP systems while maintaining our own visual identity.

---

# Team Philosophy

Every contributor owns a domain.

No contributor owns the entire codebase.

Architecture decisions remain centralized.

Implementation remains distributed.

Every contribution must improve the architecture.

---

# Git Philosophy

The repository must always remain deployable.

Rules:

- One repository
- One permanent main branch
- Short-lived feature branches
- Small Pull Requests
- Frequent commits
- Frequent pushes
- Main is always stable

No direct commits to `main`.

---

# Definition of Success

Success is NOT measured by:

- Number of features
- Lines of code
- AI usage
- Fancy animations

Success is measured by:

- Architecture
- Database Design
- Workflow Design
- Code Quality
- Scalability
- Maintainability
- Engineering Discipline

---

# Final Rule

Every AI agent and every developer must remember:

> **We are not building a demo.**
>
> **We are building an enterprise ERP system that solves the AssetFlow problem using architecture-first engineering principles.**

If a decision improves architecture, prefer it.

If a decision only makes coding faster, reject it.

---

**Next Document**

➡ **01_PROJECT_OVERVIEW.md**