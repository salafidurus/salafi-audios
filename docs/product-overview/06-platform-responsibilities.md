# Platform Responsibilities

## Introduction

Salafi Durus is a multi-platform system composed of a mobile application, a web application, and a backend service. Each platform exists for a specific purpose and is intentionally constrained in scope.

Clear responsibility boundaries are essential to:
- Maintain consistency
- Prevent duplication of logic
- Reduce security risks
- Enable long-term maintainability

This document defines what each platform is responsible for, and just as importantly, what it is **not** responsible for.

---

## Responsibility as a Design Principle

In Salafi Durus, responsibilities are assigned according to the nature of the task:

- **User interaction and experience** belong to clients
- **Authority, rules, and truth** belong to the backend
- **Durability and delivery** belong to infrastructure

No platform attempts to do everything. Instead, each does a limited set of things well.

---

## Mobile Application Responsibilities

### Primary Purpose

The mobile application is the **primary listening interface** for Salafi Durus.

It is designed to support:
- Frequent, long-form listening
- Offline usage
- Personal study routines

### What the Mobile App Is Responsible For

The mobile application is responsible for:

- Navigation and presentation of content
- Audio playback and queue management
- Offline downloads and local file handling
- Local caching for performance and offline access
- Capturing listening progress and user actions
- Synchronizing local state with the backend
- Providing administrative and moderation capabilities for authorized users

The mobile app is optimized for responsiveness, reliability, and usability in real-world conditions.

### What the Mobile App Is Not Responsible For

The mobile application must not:

- Enforce business rules
- Decide content visibility or publication state
- Directly modify authoritative data stores
- Contain secret credentials or infrastructure access
- Act as a source of truth for platform state

All authoritative decisions are delegated to the backend.

---

## Web Application Responsibilities

### Primary Purpose

The web application serves as both:
- A **public discovery and listening interface**
- A **powerful administrative and editorial workspace**

It complements the mobile experience rather than replacing it.

### What the Web App Is Responsible For

The web application is responsible for:

- Public-facing pages for scholars, series, and lectures
- Search engine visibility and shareable content
- Web-based audio playback
- Account access and library views
- Administrative dashboards and editorial workflows
- Bulk operations such as multi-file uploads and batch editing

The web app excels at tasks that benefit from larger screens, keyboards, and structured interfaces.

### What the Web App Is Not Responsible For

The web application must not:

- Bypass backend authorization rules
- Access databases or storage systems directly
- Duplicate business logic
- Assume trust beyond what the backend grants

Like the mobile app, it remains a consumer of backend services.

---

## Backend Responsibilities

### Primary Purpose

The backend is the **authoritative core** of Salafi Durus.

It exists to centralize control, enforce rules, and coordinate the system as a whole.

### What the Backend Is Responsible For

The backend is responsible for:

- Authentication and authorization
- Role and permission enforcement
- Content lifecycle management
- Data validation and integrity
- Upload authorization and coordination
- Reference management for media assets
- Synchronization and conflict resolution
- Centralized moderation and oversight

The backend is the single source of truth for all platform state.

### What the Backend Is Not Responsible For

The backend must not:

- Handle presentation or UI logic
- Stream media directly to users
- Store large media files inline
- Maintain client-specific UI state

It focuses on coordination, not interaction.

---

## Infrastructure Responsibilities

### Primary Purpose

Infrastructure components exist to support performance, durability, and scale.

### What Infrastructure Is Responsible For

Infrastructure is responsible for:

- Durable storage of relational data
- Storage and delivery of media assets
- Global content distribution
- Event and analytics storage
- Availability and fault tolerance

Infrastructure systems are chosen based on their ability to perform these tasks efficiently and reliably.

---

## Cross-Platform Cooperation

While responsibilities are separated, platforms cooperate through well-defined interfaces:

- Clients communicate exclusively through backend APIs
- Media access is mediated through backend-issued references
- Synchronization flows respect authoritative resolution rules

This cooperation ensures consistency without coupling.

---

## Enforced Boundaries

Salafi Durus intentionally enforces boundaries between platforms.

Violations of these boundaries—such as embedding business rules in clients or bypassing backend authorization—are treated as architectural defects, not shortcuts.

These boundaries protect:
- Security
- Maintainability
- Trust

---

## Benefits of Clear Responsibility Allocation

By enforcing strict platform responsibilities, Salafi Durus gains:

- Predictable behavior
- Easier debugging and reasoning
- Independent evolution of platforms
- Reduced risk of regressions
- Clear ownership of changes

This clarity is especially important as the system grows and more contributors become involved.

---

## Closing Note

Platform responsibilities in Salafi Durus are not arbitrary. They are the result of deliberate design choices aimed at preserving integrity, usability, and longevity.

Every feature and change should respect these boundaries. When responsibilities remain clear, the platform remains stable, trustworthy, and adaptable.
