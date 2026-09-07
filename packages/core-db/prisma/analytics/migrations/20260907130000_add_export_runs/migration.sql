CREATE TYPE "analytics"."AnalyticsExportRunStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE "analytics"."analytics_export_runs" (
    "id" TEXT NOT NULL,
    "parameter_hash" TEXT NOT NULL,
    "activation_watermark" TIMESTAMP(3) NOT NULL,
    "from_received_at" TIMESTAMP(3) NOT NULL,
    "to_received_at" TIMESTAMP(3) NOT NULL,
    "format_version" TEXT NOT NULL,
    "dataset_version" TEXT NOT NULL,
    "status" "analytics"."AnalyticsExportRunStatus" NOT NULL DEFAULT 'pending',
    "cursor_received_at" TIMESTAMP(3),
    "cursor_event_id" TEXT,
    "next_part" INTEGER NOT NULL DEFAULT 0,
    "manifest" JSONB,
    "claimed_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_export_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "analytics_export_runs_parameter_hash_key"
  ON "analytics"."analytics_export_runs"("parameter_hash");
CREATE INDEX "idx_analytics_export_run_lease"
  ON "analytics"."analytics_export_runs"("status", "claimed_at");
CREATE INDEX "idx_analytics_event_received_cursor"
  ON "analytics"."analytics_events"("received_at", "event_id");

CREATE TABLE "analytics"."analytics_export_activation" (
    "id" TEXT NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_export_activation_pkey" PRIMARY KEY ("id")
);
