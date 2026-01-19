# Media Upload and Delivery

## Introduction

Media handling is one of the most sensitive and performance-critical aspects of Salafi Durus.

Audio lectures and images represent the largest data volume in the system, and they are accessed far more frequently than they are modified. This document defines how media is uploaded, stored, delivered, and replaced in a way that is secure, scalable, and cost-efficient.

The backend coordinates all media operations, but it does not act as a media server.

---

## Core Principles

Media handling in Salafi Durus follows these principles:

- Media files are not stored in the application database
- The backend authorizes and coordinates all media operations
- Clients never receive permanent storage credentials
- Uploads and downloads scale independently from application logic
- Media delivery is optimized for read-heavy workloads

These principles ensure that media handling remains efficient and maintainable as usage grows.

---

## Media Types

Salafi Durus manages several categories of media:

- **Lecture audio files**
- **Scholar images**
- **Series cover images**

Each category follows the same fundamental handling model, with differences only in size, frequency, and editorial workflow.

---

## Upload Authorization Model

### Backend-Coordinated Uploads

All uploads are authorized by the backend.

The backend:
- Validates the uploader’s identity and role
- Confirms the purpose of the upload
- Issues time-limited upload permissions
- Records media references only after successful upload

Clients never upload media without backend authorization.

---

### Presigned Upload Flow

The preferred upload mechanism is a presigned upload flow.

The conceptual flow is:

1. Client requests upload authorization
2. Backend validates permissions and intent
3. Backend issues a time-bound upload permission
4. Client uploads media directly to storage
5. Client notifies backend of completion
6. Backend records the media reference

This approach:
- Avoids routing large files through the backend
- Reduces server load and cost
- Improves upload reliability
- Scales naturally with traffic

---

## Single vs Bulk Uploads

### Single Uploads

Single uploads are used for:
- Individual lecture creation
- Media replacement
- Quick administrative actions
- Mobile-based uploads

Single uploads:
- Are optimized for speed and simplicity
- Require explicit metadata submission
- Default to draft or review states

This workflow is especially important for mobile administration.

---

### Bulk Uploads

Bulk uploads are optimized for:
- Large lecture series
- Initial content ingestion
- Desktop-based editorial workflows

Bulk upload workflows:
- Group multiple files under a single session
- Allow metadata editing after upload
- Support ordering and batch publishing
- Are primarily exposed through the web interface

Bulk operations remain coordinated by the backend to preserve consistency.

---

## Media Reference Management

### Database Representation

The database stores **references to media**, not the media itself.

A media reference includes:
- Storage identifier or key
- Media type
- Associated entity (lecture, scholar, series)
- Optional version or replacement metadata

Media references are immutable by default.

---

### Media Replacement

Replacing media is an explicit editorial action.

Rules for replacement:
- Replacement requires elevated permissions
- The new media reference supersedes the old one
- The old media may be retained or archived
- Replacement does not occur implicitly

This prevents accidental data loss and supports correction workflows.

---

## Media Delivery

### Read-Optimized Delivery

Media delivery is optimized for read-heavy usage.

Audio and images are delivered through:
- Object storage
- A content delivery network (CDN)

This ensures:
- Low latency
- Global availability
- Reduced load on backend services

The backend never streams media directly.

---

### Access Control for Media

Media access is controlled through:
- Backend-issued references
- Publication state of associated content
- Optional signed access for restricted assets

Public content may be delivered via stable URLs. Restricted or unpublished content may require time-limited access URLs.

---

## Mobile and Web Differences

### Mobile Upload Considerations

Mobile uploads:
- Favor single-file workflows
- Prioritize reliability over speed
- Must tolerate intermittent connectivity

Mobile clients rely heavily on resumable or retryable uploads where possible.

---

### Web Upload Considerations

Web uploads:
- Support bulk operations
- Provide richer metadata editing
- Optimize for throughput and visibility

The same backend authorization rules apply to both platforms.

---

## Failure Handling

Media upload failures are expected and handled explicitly.

If an upload fails:
- No database records are created
- Partial uploads are ignored or cleaned up
- Clients may retry with new authorization

Media delivery failures:
- Do not affect core metadata access
- Degrade playback gracefully
- Do not corrupt platform state

---

## Cost and Scalability Considerations

The media architecture is designed to:
- Minimize backend bandwidth usage
- Reduce unnecessary data transfer
- Scale independently from application logic

By offloading media delivery to dedicated infrastructure, Salafi Durus remains cost-effective as usage grows.

---

## Security Considerations

Media handling enforces strict security boundaries:

- Upload permissions are short-lived
- Storage credentials are never exposed
- Media modification requires explicit authorization
- Backend validates all references

These constraints protect both infrastructure and content integrity.

---

## Closing Note

Media upload and delivery in Salafi Durus are treated as first-class architectural concerns.

By separating coordination from storage, enforcing explicit authorization, and optimizing for read-heavy access patterns, the platform delivers reliable media access without sacrificing security or scalability.

All future media-related features must adhere to the principles defined in this document.
