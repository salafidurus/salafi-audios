CREATE TABLE "analytics_identity_links" (
    "user_id" TEXT NOT NULL,
    "pseudonymous_identity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_identity_links_pkey" PRIMARY KEY ("user_id")
);

CREATE UNIQUE INDEX "analytics_identity_links_pseudonymous_identity_key"
  ON "analytics_identity_links"("pseudonymous_identity");

ALTER TABLE "analytics_identity_links"
  ADD CONSTRAINT "analytics_identity_links_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
