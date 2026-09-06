-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "analytics_events" (
    "event_id" TEXT NOT NULL,
    "payload_fingerprint" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "schema_version" TEXT NOT NULL,
    "pseudonymous_identity" TEXT,
    "consent_state" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "app_version" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "listing_slug" TEXT,
    "scholar_slug" TEXT,
    "canonical_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "idx_analytics_event_name_occurred_at" ON "analytics_events"("event_name", "occurred_at");
CREATE INDEX "idx_analytics_identity_occurred_at" ON "analytics_events"("pseudonymous_identity", "occurred_at");
CREATE INDEX "idx_analytics_listing_occurred_at" ON "analytics_events"("listing_slug", "occurred_at");
CREATE INDEX "idx_analytics_scholar_occurred_at" ON "analytics_events"("scholar_slug", "occurred_at");
