CREATE TYPE "AnalyticsDispatchStatus" AS ENUM ('pending', 'processing', 'delivered', 'dead_letter');

CREATE TABLE "analytics_dispatch_intents" (
    "event_id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AnalyticsDispatchStatus" NOT NULL DEFAULT 'pending',
    "claimed_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_dispatch_intents_pkey" PRIMARY KEY ("event_id")
);

CREATE INDEX "idx_analytics_dispatch_due"
    ON "analytics_dispatch_intents"("status", "available_at");

CREATE INDEX "idx_analytics_dispatch_subject_created"
    ON "analytics_dispatch_intents"("subject_id", "created_at");

CREATE OR REPLACE FUNCTION "enqueue_user_registered_analytics_intent"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO "analytics_dispatch_intents" (
    "event_id",
    "event_name",
    "subject_id",
    "payload"
  )
  VALUES (
    gen_random_uuid()::text,
    'user_registered',
    NEW."id",
    jsonb_build_object('subject_id', NEW."id")
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER "user_registered_analytics_intent"
AFTER INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION "enqueue_user_registered_analytics_intent"();
