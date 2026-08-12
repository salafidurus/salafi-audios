# Dokploy Server Provisioning

## Scope

This runbook describes how to create a new Hetzner server and make a fresh
Dokploy installation securely accessible through `vps.salafidurus.com`.

It does not cover backups, recovery, Redis, API deployment, GHCR, webhooks,
health checks, application configuration, or resource limits.

## 1. Create the server

Create a Hetzner VPS with at least:

- 2 vCPU
- 4 GB RAM
- Ubuntu 24.04 LTS preferred
- Public IPv4
- SSH-key authentication

Do not tie this procedure to a specific Hetzner SKU.

## 2. Attach the temporary Hetzner Cloud Firewall

Attach the existing **Hetzner Cloud Firewall** named:

```text
salafi-durus-new-server-setup
```

This is a firewall resource in the Hetzner Cloud Console. It is not a server
name, server label, Dokploy setting, shell script, or deployment profile.

Allow inbound:

```text
TCP 22    SSH
TCP 80    HTTP
TCP 443   HTTPS
TCP 3000  temporary Dokploy setup interface
ICMP      diagnostics
```

Do not expose TCP 20 or Redis port 6379.

## 3. SSH into the server

```bash
ssh root@<server-ip-address>
```

## 4. Install Dokploy

After SSH access is established, run the Dokploy installer:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Do not add Docker CLI administration commands to this runbook.

## 5. Complete initial setup

Open the initial interface over HTTP:

```text
http://<server-ip-address>:3000
```

Complete the initial Dokploy account and setup process. This is temporary
setup access; it is not the permanent management URL.

## 6. Configure the management domain

In Cloudflare DNS, point:

```text
vps.salafidurus.com
```

to:

```text
<server-ip-address>
```

Through Dokploy’s Web Server/domain settings, configure the management
dashboard at:

```text
https://vps.salafidurus.com
```

Verify that the HTTPS dashboard works before closing port 3000.

## 7. Apply the permanent Hetzner Cloud Firewall

Once `https://vps.salafidurus.com` works, replace the temporary **Hetzner
Cloud Firewall** `salafi-durus-new-server-setup` with the permanent **Hetzner
Cloud Firewall**:

```text
salafi-durus-firewall
```

The permanent firewall must not expose TCP 3000. Normal management access is
now through the HTTPS management domain.

## Completion checklist

- [ ] VPS has at least 2 vCPU and 4 GB RAM
- [ ] SSH key configured
- [ ] Hetzner Cloud Firewall `salafi-durus-new-server-setup` attached
- [ ] SSH access verified
- [ ] Dokploy installed
- [ ] Initial Dokploy setup completed through port 3000
- [ ] `vps.salafidurus.com` points to the VPS
- [ ] Dokploy dashboard works at `https://vps.salafidurus.com`
- [ ] Hetzner Cloud Firewall `salafi-durus-firewall` attached
- [ ] Port 3000 is no longer publicly exposed
