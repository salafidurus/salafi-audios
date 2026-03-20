# Product Requirements Document

## 1. Vision and Purpose

**Salafi Durus** exists to make authentic Salafi knowledge accessible, reliable, and practical for daily life.

### Problem Space

- Fragmentation: lectures are scattered across messaging apps, file links, and video platforms.
- Poor structure: scholars, series, and lessons are often unordered or missing context.
- Offline limitations: many listeners depend on intermittent connectivity.
- Trust risk: open platforms mix authentic material with unreliable content.

### Product Vision

- A trusted reference platform for curated Salafi lectures.
- A personal study companion built around listening continuity.
- A durable archive structured for clarity, discoverability, and long-term use.

## 2. Product Philosophy

### Core Principles

- **Trust over virality**: curation and moderation are more important than growth loops.
- **Usability over novelty**: features must serve listening, study, and retention.
- **Longevity over convenience**: structure and durability matter more than short-term shortcuts.

### Operating Principles

- The platform is curated, not crowdsourced.
- Structure is a first-class feature, not metadata cleanup.
- Offline support exists for continuity, not authority.
- The backend is the single source of truth for content, permissions, and canonical user state.

## 3. User Roles

- **Public listener**: discovers and streams published content.
- **Authenticated listener**: adds personal state such as progress, library, and downloads.
- **Editor**: manages scoped content, metadata, ordering, and uploads.
- **Administrator**: has global moderation, role, and platform control.

Permissions are explicit and backend-enforced. Editors have scoped trust, not broad administrative authority.

## 4. Trust and Responsibility Model

- Clients are untrusted by default.
- Authentication establishes identity, not authority.
- Authorization is explicit, role-based, and enforced on the backend for every protected action.
- Offline behavior never enables editorial or administrative actions.
- Media access is controlled through backend-issued references and upload authorization.

## 5. Core Product Areas

### Catalog and Discovery

- Stable, semantic routes for scholars, collections, series, and lectures.
- Search and browse flows designed for clear navigation through a curated corpus.

### Listening and Continuity

- Streaming on web and mobile.
- Playback continuity across sessions and devices.
- Planned offline downloads and eventual sync for personal listening state.

### Editorial Operations

- Managed content lifecycle, metadata curation, ordering, and media replacement.
- Scoped editorial control rather than open publishing.

## 6. Non-Negotiable Guardrails

- Backend authority is absolute for business rules and authoritative writes.
- UI restrictions are UX only and never count as security.
- Offline mode records intent, not final decisions.
- Core relational data and media ownership boundaries must remain explicit.
- Undocumented architectural behavior is incomplete.

## 7. Non-Goals

- No open user-generated content such as public comments or lecture submission.
- No real-time collaboration or instant cross-device convergence guarantees.
- No client-owned authority for publication state, ordering, or conflict resolution.
- No premature microservice split or speculative complexity.

## 8. Decision Framework

Add a feature only if it supports learning continuity or content integrity, respects trust boundaries, fits the existing architecture, and does not weaken moderation or backend authority.
