# Analytics Runbooks

- [Mixpanel and New Relic environment provisioning](./external-services.md)

These runbooks describe provider configuration and verification. They never
contain credential values. The application-owned product-event history remains
separate from provider analytics and observability services.

## Scheduled R2 archive export

The API runs the export hourly. Configure `R2_ANALYTICS_BUCKET_NAME` as a
dedicated private bucket and grant the API credentials access to that bucket;
do not reuse the public media bucket. `R2_ANALYTICS_PREFIX` defaults to
`analytics`.

The first run starts at scheduler activation and does not backfill historical
events. Runs are immutable and resume after interruption when their parameters
match. A checkpoint advances only after the Parquet object is uploaded and
read back successfully. Export failures are retryable and visible through API
logs and telemetry.
