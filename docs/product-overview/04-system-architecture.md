# System Architecture

## Introduction

The architecture of Salafi Durus is intentionally simple at a conceptual level, while remaining robust enough to scale with time, users, and content.

This document explains how the system is structured, how its major components interact, and why responsibilities are divided the way they are. The goal is not to describe implementation details, but to provide a clear mental model of how the platform functions as a whole.

---

## Architectural Overview

Salafi Durus is composed of three primary layers:

1. **Client Applications**
   - Mobile application
   - Web application

2. **Backend Services**
   - Central API
   - Business logic
   - Authorization and moderation

3. **Data and Media Infrastructure**
   - Primary relational database
   - Object storage and content delivery
   - Analytics and event storage

Each layer has a clearly defined role and communicates with others through well-defined interfaces.

---

## Client Applications

### Mobile Application

The mobile application is the primary listening interface for Salafi Durus.

It is responsible for:

- User interaction and navigation
- Audio playback
- Offline downloads
- Local caching and intelligent synchronization

The mobile client does **not** act as a source of truth. Instead, it behaves as a smart consumer of backend data, capable of functioning offline while remaining aligned with the server when connectivity is available.

### Web Application

The web application serves two distinct purposes:

1. **Public-facing access**
   - Discoverability of scholars, series, and lectures
   - Shareable, search-engine-friendly pages
   - Web-based listening experience

2. **Administrative and editorial interface**
   - Content management
   - Bulk uploads and editing
   - Moderation workflows

Like the mobile application, the web client does not contain business rules or authoritative data. It delegates those responsibilities to the backend.

---

## Backend Services

### Central API

At the center of the system is a single backend API.

This API is responsible for:

- Enforcing business rules
- Managing user authentication and authorization
- Handling content visibility and moderation
- Coordinating uploads and media references
- Serving data consistently to all clients

The backend is the **single source of truth** for all platform state.

### Role-Based Control

All client requests are evaluated through:

- Authentication checks
- Role-based permissions
- Scope enforcement for editors

This ensures that authority is centralized, auditable, and consistent regardless of which client initiates an action.

---

## Data and Media Infrastructure

### Relational Data Store

Core platform data—such as users, scholars, series, lectures, and listening progress—is stored in a relational database.

This choice reflects the structured nature of the domain and supports:

- Clear relationships between entities
- Predictable querying
- Long-term data integrity

### Media Storage and Delivery

Audio files and images are stored in object storage and delivered through a content delivery network (CDN).

This separation ensures:

- Efficient streaming and downloads
- Reduced load on backend services
- Scalable and cost-effective media delivery

Clients receive media URLs from the backend but do not manage storage directly.

### Analytics and Event Storage

Usage events and analytics data are intentionally separated from core platform data.

This allows:

- High-volume event ingestion without impacting core functionality
- Independent scaling and retention policies
- Future analysis without compromising primary data integrity

---

## Communication Model

All communication between clients and the backend occurs through structured API requests.

Key characteristics of this model include:

- Stateless client-server interactions
- Explicit authentication on protected routes
- Consistent data formats across platforms

Clients never communicate directly with databases or analytics systems. All such interactions are mediated by the backend.

---

## Separation of Responsibilities

A defining characteristic of the Salafi Durus architecture is **clear separation of responsibilities**:

- Clients focus on presentation, interaction, and local optimization
- The backend focuses on logic, validation, and coordination
- Infrastructure focuses on durability, scalability, and performance

This separation:

- Simplifies reasoning about the system
- Reduces coupling between components
- Enables independent evolution of each layer

---

## Resilience and Failure Boundaries

The system is designed to degrade gracefully:

- If connectivity is lost, clients continue functioning using local data
- If media delivery is temporarily unavailable, core metadata remains accessible
- If analytics systems fail, core functionality remains unaffected

By isolating responsibilities and avoiding tight coupling, failures in one area are less likely to cascade across the platform.

---

## Architectural Intent

The architecture of Salafi Durus is intentionally conservative.

It favors:

- Predictability over experimentation
- Explicit boundaries over implicit coupling
- Long-term maintainability over short-term shortcuts

This approach ensures that as the platform grows, it remains understandable, auditable, and trustworthy.

---

## Closing Note

System architecture is not merely a technical concern; it is a reflection of values.

In Salafi Durus, the architectural structure exists to protect content integrity, user trust, and the longevity of the platform. All future extensions and changes should respect the principles outlined in this document.
