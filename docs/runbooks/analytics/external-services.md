# Mixpanel and New Relic Environment Provisioning

## Purpose and boundary

This runbook provisions isolated development, preview, and production
destinations for product analytics and operational observability. Mixpanel is
an analytics sink; it is not the owned product-event archive. New Relic is an
operational telemetry destination; it is not a product-event archive.

The canonical event vocabulary and privacy boundary are defined by
[`@sd/core-analytics`](../../../packages/core-analytics/README.md) and
[ADR 0010](../../adr/0010-canonical-product-event-contract.md). Do not add
provider-specific event names or properties here.

## Ownership record

Complete this table in the restricted operations record, not with credential
values in this repository.

| Provider  | Primary owner  | Backup administrator | Recovery contact | Account/organization | Last reviewed  |
| --------- | -------------- | -------------------- | ---------------- | -------------------- | -------------- |
| Mixpanel  | To be assigned | To be assigned       | To be assigned   | To be recorded       | To be recorded |
| New Relic | To be assigned | To be assigned       | To be assigned   | To be recorded       | To be recorded |

The primary owner must be able to rotate or revoke credentials. The backup
administrator must independently be able to recover access. Do not use a
personal account as the only administrator.

## Selected account structure

The approved setup is three separate Mixpanel projects—Development, Preview,
and Production—and one New Relic account. New Relic isolation is enforced with
distinct logical services and mandatory environment attributes rather than
separate accounts.

Use a separate `Ingest - License` key for each environment where the provider
supports it. The keys authenticate ingestion and support independent rotation;
the environment attributes below are still required to distinguish telemetry
inside the shared New Relic account. Never use a `Users` key or an `Ingest -
Browser` key for API OpenTelemetry ingestion.

## Naming convention

Use exactly these environment values: `development`, `preview`, and
`production`. Do not infer the environment from a hostname, branch name, or
user agent.

### Mixpanel

Use one separately isolated project per environment:

```text
Salafi Durus - Development
Salafi Durus - Preview
Salafi Durus - Production
```

Record each project identifier and owning account in the restricted operations
record. Project tokens are environment-specific and must be provided only
through the approved runtime/deployment secret mechanism.

Mixpanel event names and properties come from the canonical contract. Preserve
`event_id`, `listing_slug`, and `scholar_slug`; do not send email, credentials,
cookies, raw sensitive search text, keystrokes, exact location, or internal
user IDs.

### New Relic

New Relic services are normally created or updated when an agent or
OpenTelemetry exporter first reports data. Do not create four blank APM
services or select a vendor-specific APM agent just to satisfy this ticket.
Record the logical names below now; the later observability implementation must
emit them consistently.

Use the OpenTelemetry setup for the API, Browser monitoring for the web app,
and the dedicated Mobile monitoring setup for iOS and Android when those
instrumentation tickets are implemented. The generated browser/mobile public
identifiers and server-side ingestion credentials must remain environment-
scoped and must not be exchanged in chat.

Use these stable service names:

```text
salafi-durus-api
salafi-durus-web
salafi-durus-ios
salafi-durus-android
```

Infrastructure entities use the corresponding runtime plus environment, for
example `salafi-durus-infrastructure-preview`. If New Relic represents
infrastructure differently, preserve the logical name and record its entity ID.

| Attribute            | Meaning                       | Example                                          |
| -------------------- | ----------------------------- | ------------------------------------------------ |
| `service.name`       | Stable logical service        | `salafi-durus-api`                               |
| `environment`        | Deployment environment        | `preview`                                        |
| `service.version`    | Application/package release   | `2026.09.04`                                     |
| `deployment.version` | Immutable deployment identity | Git commit SHA                                   |
| `platform`           | Runtime surface               | `api`, `web`, `ios`, `android`, `infrastructure` |
| `region`             | Runtime/provider region       | `hetzner-eu`, `vercel`, or `eas`                 |

Do not put exact user location in `region`. Product-event geography remains
limited to country, coarse region, or timezone.

## Secret inventory

Record secret names and locations, never values:

| Environment | Destination          | Secret name                  | Storage system                | Scope                    | Rotation owner |
| ----------- | -------------------- | ---------------------------- | ----------------------------- | ------------------------ | -------------- |
| development | Mixpanel Development | `MIXPANEL_PROJECT_TOKEN`     | developer-local secret store  | development project only | To be assigned |
| preview     | Mixpanel Preview     | `MIXPANEL_PROJECT_TOKEN`     | preview deployment secrets    | preview project only     | To be assigned |
| production  | Mixpanel Production  | `MIXPANEL_PROJECT_TOKEN`     | production deployment secrets | production project only  | To be assigned |
| development | New Relic            | `OTEL_EXPORTER_OTLP_HEADERS` | developer-local secret store  | development API only     | To be assigned |
| preview     | New Relic            | `OTEL_EXPORTER_OTLP_HEADERS` | preview deployment secrets    | preview API only         | To be assigned |
| production  | New Relic            | `OTEL_EXPORTER_OTLP_HEADERS` | production deployment secrets | production API only      | To be assigned |

The matching non-secret OpenTelemetry settings include `OTEL_SERVICE_NAME`,
`OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_PROTOCOL`, and
`OTEL_EXPORTER_OTLP_COMPRESSION`. The API's `OTEL_RESOURCE_ATTRIBUTES` are
runtime-derived and must be populated by code or deployment configuration from
the conventions above; they are intentionally absent from
[`apps/api/.env.example`](../../../apps/api/.env.example). The template contains
development-safe placeholders and the EU endpoint alternative for the static
exporter settings.

Public client configuration is allowed only when a provider explicitly
requires a public identifier. Keep it separate from write-capable or
administrative credentials and verify that it cannot select a production
destination in development or preview.

## Initial dashboards and alerts

Do not create reports that depend on events not yet implemented.

### Mixpanel

- Discovery: Explore openings, listing views, scholar views, search submission,
  and result selection.
- Listening: playback starts, meaningful milestones, completion observation,
  backend-confirmed completion, saves, and follows.
- Retention: day-one, day-seven, and day-thirty listening cohorts.
- Recommendations: exposure, position, source, algorithm/experiment context,
  clicks, dismissals, and downstream listening outcomes.

### New Relic

- API request rate, errors, latency, health endpoints, and deployment version.
- Database, Redis, storage/CDN, and downstream dependency health/timing.
- Runtime restarts, resource pressure, and infrastructure availability.
- Analytics pipeline accepted, rejected, persisted, published, retried,
  dead-lettered, and pending/backlog stages where implemented.
- Alerts for sustained errors, latency, dependency failure, health failure,
  resource pressure, restarts, provider export failure, and analytics backlog.

## Retention and limits

For each provider, record the account plan, effective retention settings,
monthly/event or ingestion limits, alert threshold, and verification date in
the restricted operations record. Provider limits are not the retention policy
for the owned event archive. Re-check them before production enablement and
after plan changes.

## Provisioning procedure

1. Confirm primary and backup administrators and recovery access.
2. Create the three Mixpanel projects, or document an equivalent isolation
   mechanism and its write-separation proof.
3. Register the New Relic logical services and infrastructure entities using
   the naming convention above, when the provider creates them from reported
   telemetry or requires explicit registration.
4. Configure environment-scoped credentials in the approved secret systems.
5. Grant minimum required provider roles; separate administration and ingestion
   credentials where supported.
6. Create the initial dashboards and alerts listed above.
7. Record provider plan, retention, limits, project/entity IDs, owners, and
   dates without recording secret values.
8. Run the verification matrix before enabling production collection.

## Verification matrix

Use unique, clearly synthetic test identifiers. Never use real user data.

| Test                                      | Expected result                                    | Evidence                  |
| ----------------------------------------- | -------------------------------------------------- | ------------------------- |
| Development Mixpanel event                | Appears only in Development project                | Project event/debug view  |
| Preview Mixpanel event                    | Appears only in Preview project                    | Project event/debug view  |
| Development credential against Production | Rejected or impossible by scope                    | Provider/API response     |
| Preview credential against Production     | Rejected or impossible by scope                    | Provider/API response     |
| Development New Relic telemetry           | `environment=development` and expected service     | NRQL/entity view          |
| Preview New Relic telemetry               | `environment=preview` and expected service         | NRQL/entity view          |
| Production New Relic telemetry            | `environment=production` and expected service      | NRQL/entity view          |
| Secret scan                               | No credential value in repository, logs, or output | `security:secrets` output |

Retain only masked evidence such as project/entity IDs, timestamps, event names,
and credential suffixes if required for audit. Never retain full tokens or keys.

## Rotation, teardown, and recovery

### Rotation

1. Create a replacement credential with minimum scope.
2. Store it in the matching environment secret system.
3. Deploy or restart the consumer in that environment.
4. Send one synthetic verification event and confirm routing.
5. Revoke the old credential and record the rotation date and owner.

### Teardown

Disable the consumer, remove the environment secret, revoke credentials, and
disable only the retired environment's provider exports, dashboards, and
alerts. Preserve production evidence and owned archive data according to the
privacy/deletion policy. Never delete a shared account, unrelated project, or
production entity during teardown.

### Recovery

The backup administrator recovers access, rotates credentials, and repeats the
verification matrix. Provider dashboards and sinks are replaceable; the owned
product-event archive remains the durable source for historical behavior.
