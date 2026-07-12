# TEAM_WORKFLOW.md

# AssetFlow Hackathon - Team Workflow & Git Strategy

> **Project:** AssetFlow ERP
> **Architecture:** Odoo-inspired Modular ERP
> **Branching Strategy:** Feature Branch → Pull Request → Main
> **Goal:** Keep `main` production-ready at all times.

---

# Team Structure

##  Team Lead — Diwakar

### Primary Responsibilities

Divakar owns the complete architecture of the project.

He is responsible for:

- System Architecture
- Backend Development
- REST API Design
- Business Logic
- Workflow Engine
- Authentication
- Authorization (RBAC)
- Database Architecture
- API Layer
- Service Layer
- Integration between frontend and backend
- Production Build
- Code Reviews
- Final Merge Approval
- Overall Project Stability

### Owned Directories

```
src/app/api/
src/lib/
src/services/
src/modules/
middleware.ts
```

Divakar is the only member responsible for making architectural decisions.

---

# Gautam — Frontend Lead

### Responsibilities

Gautam owns the entire frontend experience.

Responsible for:

- UI Components
- Dashboard
- Sidebar
- Navbar
- Forms
- Tables
- Cards
- Responsive Design
- Animations
- Layouts
- Theme
- User Experience
- Loading States
- Empty States

### Owned Directories

```
src/components/
src/app/
src/layout/
src/features/ui/
```

Should not modify:

- Backend
- Database
- Business Logic

---

#  Vansh Harit — Database & Integration Lead

### Responsibilities

Owns all database-related implementation.

Responsible for:

- Prisma ORM
- PostgreSQL Schema
- Database Relations
- Migrations
- Seed Data
- Repository Layer
- Connecting Frontend with APIs
- Query Optimization

### Owned Directories

```
prisma/
src/db/
src/repositories/
```

Should not modify

- UI
- Business Rules

---

# Garv Kathuria — QA & Support

### Responsibilities

Garv supports the team by handling lightweight implementation tasks.

Responsible for

- Manual Testing
- Form Validation Testing
- Dummy Data
- Documentation
- README
- Bug Reporting
- Icons
- Static Assets
- Labels
- Placeholder Content
- Small UI Fixes
- Demo Data
- Screenshots

### Owned Directories

```
docs/
README.md
public/
```

Garv should avoid changing backend or database logic.

---

# Development Order

Every feature must follow this sequence.

```
Business Requirement

↓

Database Design

↓

API Design

↓

Business Logic

↓

Frontend

↓

Testing

↓

Pull Request

↓

Merge into Main
```

Never skip any step.

---

# Git Strategy

## Permanent Branch

```
main
```

Rules

- Main must always compile.
- Main must always be deployable.
- Never commit broken code directly to main.

---

# Feature Branch Strategy

Each task gets its own branch.

Examples

```
feature/auth

feature/dashboard

feature/assets

feature/prisma

feature/ui-dashboard

feature/reports

feature/booking
```

One feature = One branch

---

# Daily Git Workflow

## Step 1

Start your day

```bash
git checkout main
git pull origin main
```

---

## Step 2

Create your feature branch

```bash
git checkout -b feature/<feature-name>
```

Example

```bash
git checkout -b feature/assets
```

---

## Step 3

Work normally.

Commit frequently.

Every member MUST push at least once every hour.

Example

```bash
git add .

git commit -m "feat(asset): asset registration completed"

git push origin feature/assets
```

---

## Step 4

Before opening a Pull Request

Always sync with main.

```bash
git checkout main
git pull origin main

git checkout feature/assets

git merge main
```

Resolve conflicts.

Run tests again.

Push.

---

## Step 5

Create Pull Request.

PR Template

- What changed?
- Why?
- API affected?
- Database affected?
- UI affected?
- Breaking changes?
- Testing completed?

---

## Step 6

Review

Divakar reviews architecture.

Owner of affected module reviews implementation.

---

## Step 7

Merge

Merge only if

- Build passes
- Lint passes
- No TypeScript errors
- APIs tested
- UI works
- Database migrations work
- No merge conflicts

Only then merge into `main`.

---

# Merge Authority

Only Divakar merges into `main`.

Everyone else creates Pull Requests.

---

# Conflict Prevention

Ownership

### Divakar

```
src/app/api/
src/lib/
src/services/
middleware.ts
```

---

### Gautam

```
src/components/
src/app/
src/layout/
```

---

### Vansh Harit

```
prisma/
src/db/
src/repositories/
```

---

### Garv

```
docs/
README.md
public/
```

Never edit another member's owned files without discussion.

---

# AI Agent Git Module

Every AI coding agent must follow this workflow before proposing a merge.

## Before Coding

1. Pull latest `main`
2. Create feature branch
3. Read project architecture
4. Never modify files outside assigned ownership
5. Keep changes scoped to one feature

---

## Before Every Commit

Run

```bash
npm run lint
```

Run

```bash
npm run build
```

Run project tests (if available).

Ensure

- No TypeScript errors
- No ESLint errors
- No build failures

Then

```bash
git add .
git commit -m "<meaningful commit message>"
git push origin <feature-branch>
```

---

## Before Creating Pull Request

AI Agent Checklist

- Latest `main` merged into feature branch
- Merge conflicts resolved
- Build successful
- Lint successful
- Database migrations valid
- APIs tested
- UI tested
- No console errors
- Documentation updated (if required)

Only then create Pull Request.

---

## Pull Request Rules

Every PR should be

- Small
- Focused
- One feature only

Never combine unrelated changes.

---

# Commit Message Convention

```
feat(asset): add asset registration

feat(api): implement allocation endpoint

feat(ui): dashboard cards

fix(api): duplicate allocation bug

fix(ui): responsive sidebar

refactor(auth): simplify middleware

docs: update README
```

---

# Definition of Done

A task is complete only when

- Build passes
- Lint passes
- No TypeScript errors
- Backend tested
- Frontend tested
- API validated
- Documentation updated (if applicable)
- Changes pushed to GitHub
- Pull Request created
- Approved by Divakar
- Merged into `main`

---

# Team Rules

- Architecture before implementation.
- Keep modules independent.
- Never duplicate business logic.
- Reuse services wherever possible.
- Validate all inputs.
- Protect the `main` branch.
- Commit at least once every hour.
- Keep Pull Requests small.
- Keep `main` production-ready at all times.
- Quality is more important than quantity.

---

# Final Goal

Build a modular, scalable ERP system inspired by Odoo's engineering principles—not by copying Odoo's code or UI, but by following clean architecture, strong database design, reusable business logic, and disciplined collaboration.
