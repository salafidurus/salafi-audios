# Dokploy Disaster Recovery

## Scope

Use this runbook when the existing Dokploy VPS is gone or unusable and Salafi
Durus must be restored onto a replacement server.

Follow [Dokploy Server Provisioning](./dokploy-server-provisioning.md) for
fresh-host setup and [Dokploy Backup](./dokploy-backup.md) for backup
configuration. Do not apply the permanent firewall until the final step here.

## Recovery overview

```text
Provision replacement VPS
        ↓
Install fresh Dokploy
        ↓
Connect to existing R2 backup
        ↓
Restore Dokploy Web Server backup
        ↓
Update Dokploy server IP
        ↓
Update Cloudflare DNS
        ↓
Reload Traefik
        ↓
Redeploy Production Redis
        ↓
Verify Production REDIS_URL
        ↓
Redeploy Production API
        ↓
Redeploy Preview Redis
        ↓
Verify Preview REDIS_URL
        ↓
Redeploy Preview API
        ↓
Verify health
        ↓
Verify deployment automation
        ↓
Apply permanent firewall
```

## 1. Provision the replacement server

Follow the provisioning runbook, but stop before applying the permanent
firewall. At this stage the temporary **Hetzner Cloud Firewall**
`salafi-durus-new-server-setup` remains attached and:

```text
http://<new-server-ip>:3000
```

must be accessible.

## 2. Connect Dokploy to the existing R2 backup

Through the fresh Dokploy UI, configure the existing private R2 destination:

```text
vps-dokploy-backups
```

Enter credentials through the UI, test the connection, and verify that an
existing backup is available.

## 3. Restore the Dokploy Web Server backup

Through:

```text
Web Server → Backups
```

select the appropriate backup and restore it. This restores Dokploy’s
control-plane configuration; it does not recreate running application or Redis
workloads on the replacement VPS.

## 4. Mandatory: update the restored server IP

After the restore, open:

```text
Web Server → Server
```

Use the server update function, replace `<old-server-ip>` with
`<new-server-ip>`, and save. This is mandatory after restoring onto a new
host.

## 5. Update Cloudflare DNS

Update relevant Cloudflare A records from the old address to the new address,
including, when present:

```text
vps.salafidurus.com
api.salafidurus.com
preview-api.salafidurus.com
```

Update any additional hostname hosted by this Dokploy VPS.

## 6. Mandatory: reload Traefik

Open:

```text
Web Server → Traefik → Reload Traefik
```

This is mandatory after restoration. If DNS reaches the new server but a
domain returns `404 page not found`, traffic is reaching Traefik while the
restored domain routing has not been activated. Reloading Traefik applies the
restored routing configuration. Verify `https://vps.salafidurus.com` afterward.

## 7. Mandatory: redeploy workloads manually

Restoring Dokploy control-plane state does not recreate running workloads.
Redeploy every workload through the Dokploy UI:

```text
Production
├── Redis
└── API

Preview
├── Redis
└── API
```

> **Important:** Always redeploy Redis before its corresponding API. The API
> depends on Redis’s current Internal Connection URL, which may change on a
> replacement host. Deploy Redis, obtain its current URL, verify `REDIS_URL`,
> and only then deploy the API.

## 8. Recover Production

### 8.1 Redeploy Production Redis

In `Production → Redis`, redeploy Redis and wait until it is running.

### 8.2 Obtain the current Internal Connection URL

From the Production Redis UI, obtain its current Internal Connection URL. Do
not record the value in this repository.

### 8.3 Verify Production API `REDIS_URL`

In `Production → API → Environment`, compare `REDIS_URL` with the current
Production Redis Internal Connection URL. Replace a stale restored hostname,
then save.

### 8.4 Redeploy Production API

Redeploy the Production API through Dokploy. The expected image is:

```text
ghcr.io/salafidurus/salafi-durus-api:production
```

Do not rebuild the image during recovery.

## 9. Verify Production

Verify:

```text
https://api.salafidurus.com/health/healthz
https://api.salafidurus.com/health
```

The full health response must report database, CDN/storage, and Redis as
healthy. Do not treat Production as recovered while Redis is unavailable.

## 10. Recover Preview

Repeat the same dependency order:

1. Redeploy Preview Redis through `Preview → Redis`.
2. Obtain its current Internal Connection URL.
3. In `Preview → API → Environment`, ensure `REDIS_URL` points to Preview
   Redis, never Production Redis.
4. Redeploy Preview API with:

```text
ghcr.io/salafidurus/salafi-durus-api:preview
```

## 11. Verify Preview

Verify:

```text
https://preview-api.salafidurus.com/health/healthz
https://preview-api.salafidurus.com/health
```

The full health response must report all required dependencies as healthy.

## 12. Verify deployment automation and monitoring

After both environments are healthy, verify the existing GitHub deployment flow
using the `preview` and `production` GitHub Environments and their
environment-scoped `DOKPLOY_DEPLOY_WEBHOOK` values. Verify Preview first:

```text
promote image → invoke Preview Dokploy webhook → deploy Preview → pass health check
```

Verify Production separately when safe. Also verify Dokploy Slack notifications
and any configured external uptime/health monitoring through their UIs.

## 13. Apply the permanent firewall

Only after the management, Production, and Preview URLs work, replace the
temporary **Hetzner Cloud Firewall**:

```text
salafi-durus-new-server-setup
```

with the permanent **Hetzner Cloud Firewall**:

```text
salafi-durus-firewall
```

Confirm TCP 3000 is no longer publicly accessible.

## Recovery Checklist

### Replacement Server

- [ ] Replacement VPS provisioned
- [ ] Minimum 2 vCPU / 4 GB RAM
- [ ] Temporary Hetzner Cloud Firewall `salafi-durus-new-server-setup` attached
- [ ] Fresh Dokploy installed
- [ ] Fresh Dokploy UI accessible on port 3000

### Dokploy Restore

- [ ] Existing R2 backup destination configured
- [ ] Backup successfully restored
- [ ] Server IP updated under `Web Server → Server`
- [ ] Cloudflare DNS updated to replacement IP
- [ ] Traefik reloaded under `Web Server → Traefik`
- [ ] `https://vps.salafidurus.com` works

### Production

- [ ] Production Redis redeployed FIRST
- [ ] Current Production Redis Internal Connection URL obtained
- [ ] Production API `REDIS_URL` verified/updated
- [ ] Production API redeployed
- [ ] Production `/health/healthz` succeeds
- [ ] Production `/health` reports database, CDN, and Redis healthy

### Preview

- [ ] Preview Redis redeployed FIRST
- [ ] Current Preview Redis Internal Connection URL obtained
- [ ] Preview API `REDIS_URL` verified/updated
- [ ] Preview API redeployed
- [ ] Preview `/health/healthz` succeeds
- [ ] Preview `/health` reports all dependencies healthy

### Final Verification

- [ ] Preview GitHub → Dokploy deployment verified
- [ ] Production GitHub → Dokploy deployment verified
- [ ] Slack notifications verified
- [ ] External uptime monitoring verified where configured
- [ ] Permanent Hetzner Cloud Firewall `salafi-durus-firewall` attached
- [ ] Port 3000 no longer publicly exposed
