# Dokploy Backup

## Scope

This runbook describes routine backup of a healthy Dokploy server to Cloudflare
R2 and verification that usable backups exist. Provisioning and disaster
recovery are separate runbooks.

## Backup architecture

Dokploy Web Server backups are stored off-server in the private Cloudflare R2
bucket:

```text
vps-dokploy-backups
```

The Web Server backup protects Dokploy control-plane state, including its
internal PostgreSQL state and `/etc/dokploy`. It is not a complete VPS disk
image and does not by itself include the Ubuntu installation, Hetzner firewall
configuration, Cloudflare DNS configuration, arbitrary Docker volumes, or the
physical server.

## Configure Cloudflare R2

Create or use a dedicated private R2 bucket for Dokploy backups. Create a
dedicated R2 API token with only the permissions required for this bucket.
Enter credentials through the Dokploy UI; never commit them here.

Use placeholders when recording configuration notes:

```text
<r2-access-key-id>
<r2-secret-access-key>
<r2-endpoint>
```

Configure the R2 destination as an S3-compatible destination in Dokploy and
test the connection through the UI.

## Configure the Web Server backup

In Dokploy, open:

```text
Web Server → Backups
```

Configure the backup to target `vps-dokploy-backups`, then set an appropriate
schedule and retention policy. Run an initial manual backup.

A schedule alone does not prove that backups are operational. Confirm that the
manual backup completes successfully and that the resulting backup object is
visible in the private Cloudflare R2 bucket.

## Restore testing

Periodically test a backup by restoring it onto a disposable or replacement
Dokploy installation. Follow [Dokploy Disaster Recovery](./dokploy-disaster-recovery.md)
for the recovery procedure; do not duplicate it here.

> **Redis caveat:** Dokploy Web Server backup must not be assumed to back up
> arbitrary Redis volume data. Redis persistence and volume backup are a
> separate concern and require a separately verified procedure.

## Completion checklist

- [ ] Dedicated private R2 backup bucket exists
- [ ] Dedicated R2 credentials configured
- [ ] R2 destination configured in Dokploy
- [ ] R2 connection test succeeds
- [ ] Web Server backup configured
- [ ] Scheduled backup configured
- [ ] Manual backup completed successfully
- [ ] Backup object verified in Cloudflare R2
- [ ] Retention policy configured
- [ ] Restore procedure documented separately
