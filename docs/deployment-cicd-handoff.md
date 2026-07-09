# DentiFlow CI/CD Deployment Handoff

This note summarizes the production deployment work done so far and the current state to continue from another session.

## Current Deployment Target

- Cloud provider: Azure VM, Ubuntu
- Public IP used for testing: `68.221.171.244`
- Docker Hub username: `abdelazizkazoum2`
- GitHub branch used for deployment during setup: `feature/treatment-imp`
- Production compose file for VPS/VM pulls: `docker-compose.deploy.yml`
- Local/buildable production compose file: `docker-compose.prod.yml`
- GitHub Actions workflow: `.github/workflows/deploy-prod.yml`
- Public reverse proxy: Dockerized Nginx using `nginx/default.conf`

## Docker Hub Images

The workflow builds and pushes separate Docker Hub repositories:

- `abdelazizkazoum2/dentiflow-migrations`
- `abdelazizkazoum2/dentiflow-auth-service`
- `abdelazizkazoum2/dentiflow-clinic-service`
- `abdelazizkazoum2/dentiflow-patient-service`
- `abdelazizkazoum2/dentiflow-appointment-service`
- `abdelazizkazoum2/dentiflow-treatment-service`
- `abdelazizkazoum2/dentiflow-api-gateway`
- `abdelazizkazoum2/dentiflow-frontend`

The deployment compose pulls images using `${IMAGE_TAG}`. The workflow sets `IMAGE_TAG` to the commit SHA during deploy.

## GitHub Actions Secrets And Variables

Required repository secrets:

- `DOCKERHUB_TOKEN`
- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`

The workflow currently hardcodes the Docker Hub username as:

```yaml
DOCKERHUB_USERNAME: abdelazizkazoum2
```

Required repository variables:

- `PROD_NEXT_PUBLIC_API_URL`
- `PROD_NEXT_PUBLIC_DEFAULT_CLINIC_ID`

Current production values:

```text
PROD_NEXT_PUBLIC_API_URL=https://dentiflow.site
PROD_NEXT_PUBLIC_DEFAULT_CLINIC_ID=00000000-0000-4000-8000-000000000001
```

## VPS/VM Files

The VM should contain:

```text
/opt/dentiflow/.env.prod
/opt/dentiflow/docker-compose.deploy.yml
/opt/dentiflow/nginx/default.conf
/opt/dentiflow/nginx/default.https.conf
```

`docker-compose.deploy.yml` is copied by GitHub Actions using `appleboy/scp-action`.

Expected `.env.prod` values include:

```env
DOCKERHUB_USERNAME=abdelazizkazoum2
IMAGE_TAG=latest

MYSQL_ROOT_PASSWORD=<strong secret>
JWT_SECRET=<strong secret>
REFRESH_TOKEN_SECRET=<strong secret>
NEXTAUTH_SECRET=<strong secret>
NEXTAUTH_SESSION_COOKIE_NAME=dentiflow-prod.session-token

FRONTEND_URL=https://dentiflow.site
NEXTAUTH_URL=https://dentiflow.site
NEXT_PUBLIC_API_URL=https://dentiflow.site
NEXT_PUBLIC_DEFAULT_CLINIC_ID=00000000-0000-4000-8000-000000000001

DENTIFLOW_SEED_DEFAULT_ADMIN=true
DEFAULT_ADMIN_CLINIC_ID=00000000-0000-4000-8000-000000000001
DEFAULT_ADMIN_EMAIL=admin@dentiflow.local
DEFAULT_ADMIN_PASSWORD=Admin123!
DEFAULT_ADMIN_FULL_NAME=DentiFlow Admin

PROD_BIND_ADDRESS=127.0.0.1
PROD_FRONTEND_PORT=3000
PROD_API_PORT=3001
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

## Azure Network Requirements

Azure inbound security rules must allow:

- TCP `22`
- TCP `80`
- TCP `443`

After Nginx is in front of the app, TCP `3000` and TCP `3001` do not need public inbound Azure rules. The compose file can still bind them to `127.0.0.1` for local debugging from inside the VM.

Ubuntu UFW should also allow:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

If old direct app rules exist, remove them after confirming Nginx works:

```bash
sudo ufw delete allow 3000/tcp
sudo ufw delete allow 3001/tcp
```

## Health Checks

Browser:

```text
https://dentiflow.site
https://dentiflow.site/api-gateway/health
```

From VM:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml ps
curl -I http://127.0.0.1
curl http://127.0.0.1/api-gateway/health
curl -k -I https://127.0.0.1
curl -I http://127.0.0.1:3000
curl http://127.0.0.1:3001/health
```

Seeded admin login:

```text
admin@dentiflow.local
Admin123!
```

## Important Fixes Already Made

### Production Compose Readiness

- Added `docker-compose.deploy.yml` for CI/CD deployment.
- Removed all `build:` sections from deploy compose.
- Deploy compose pulls Docker Hub images only.
- Added `treatment-service` and `treatment-migrations` to production/deploy compose.
- Added `db-bootstrap` to create all service databases when MySQL volume is fresh.
- Removed dependency on local MySQL init bind mount from deploy compose.

### Migration Image

- Updated `services/Dockerfile.migrations` earlier to include `treatment-service`.

### Database Bootstrap Fix

`db-bootstrap` was failing in GitHub Actions deployment. It was changed in both compose files to:

- wait until MySQL accepts remote connections
- create required databases
- avoid fragile `GRANT` statements

### Deployment Logging

The GitHub Actions deploy step now prints compose status and logs for:

- `db`
- `db-bootstrap`
- all migration services

when `docker compose up` fails.

### Default Seed Data

Added/used seeded data:

- Auth default admin migration:
  `services/auth-service/src/infrastructure/persistence/migrations/20260415130000-SeedDefaultAdminUser.ts`
- Appointment/queue seed:
  `services/appointment-service/src/infrastructure/persistence/migrations/20260511000002-SeedInitialAppointments.ts`
- Deterministic patient fix:
  `services/patient-service/src/infrastructure/persistence/migrations/20260708000001-SeedDeterministicQueuePatients.ts`

The deterministic patient migration fixes the waiting room treatment error:

```json
{
  "message": "Patient \"00000000-0000-4000-8000-00000000c001\" not found",
  "statusCode": 404
}
```

Cause: appointment/queue seed used fixed patient IDs, while the old patient seed generated random UUIDs.

Fix: upsert patients:

- `00000000-0000-4000-8000-00000000c001` Alice Johnson
- `00000000-0000-4000-8000-00000000c002` Michael Chen
- `00000000-0000-4000-8000-00000000c003` Sarah Williams

This does not force the treatment page to always load Alice. The selected queue entry still controls the patient ID.

## Current Next Step

Commit and deploy the deterministic patient migration if not already pushed:

```bash
git add services/patient-service/src/infrastructure/persistence/migrations/20260708000001-SeedDeterministicQueuePatients.ts
git commit -m "Seed deterministic patients for waiting room appointments"
git push origin feature/treatment-imp
```

After GitHub Actions succeeds:

1. Open frontend.
2. Login with seeded admin.
3. Go to waiting room.
4. Click **Start Treatment** for Alice Johnson.
5. Confirm the treatment workspace loads without the `Patient ...c001 not found` error.

## Useful Debug Commands

On VM:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml ps
docker compose --env-file .env.prod -f docker-compose.deploy.yml logs --no-color patient-migrations patient-service appointment-service treatment-service api-gateway frontend
docker compose --env-file .env.prod -f docker-compose.deploy.yml logs --no-color db db-bootstrap
```

Check images:

```bash
docker images | grep dentiflow
```

Restart stack manually:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml up -d --no-build --remove-orphans
```

## Nginx Reverse Proxy Notes

Nginx runs as a container in the same Docker network as the frontend and API gateway. It listens publicly on ports `80` and `443`. HTTP redirects to HTTPS, HTTPS proxies the app to the `frontend:3000` container, and Nginx exposes only a debug health alias:

```text
http://dentiflow.site -> https://dentiflow.site
https://dentiflow.site -> frontend:3000
https://dentiflow.site/api-gateway/health -> api-gateway:3001/health
```

Do not route all `/api/v1/*` traffic directly to the API gateway in Nginx right now. The Next.js frontend has a BFF route at `/api/v1/[...path]` that reads the secure NextAuth session cookie and adds backend tokens server-side.

## HTTPS Setup

Current HTTPS status:

```text
https://dentiflow.site is live
http://dentiflow.site redirects to https://dentiflow.site
https://dentiflow.site/api-gateway/health returns API gateway health
Let's Encrypt certificate expires on 2026-10-07
```

DNS must already point to the VPS before requesting certificates:

```text
dentiflow.site
www.dentiflow.site
app.dentiflow.site
api.dentiflow.site
```

Before the first certificate exists, deploy with `nginx/default.conf`, which serves HTTP and the Let's Encrypt challenge path.

Azure inbound rules and UFW must allow TCP `80` and `443`:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

Request the certificate from the VM:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d dentiflow.site \
  -d www.dentiflow.site \
  -d app.dentiflow.site \
  -d api.dentiflow.site
```

After Certbot succeeds, switch Nginx to the HTTPS config on the VM:

```bash
cd /opt/dentiflow
cp nginx/default.https.conf nginx/default.conf
docker compose --env-file .env.prod -f docker-compose.deploy.yml up -d nginx
docker compose --env-file .env.prod -f docker-compose.deploy.yml exec nginx nginx -s reload
```

Then update `/opt/dentiflow/.env.prod`:

```env
FRONTEND_URL=https://dentiflow.site
NEXTAUTH_URL=https://dentiflow.site
NEXT_PUBLIC_API_URL=https://dentiflow.site
```

Also update GitHub repository variable:

```text
PROD_NEXT_PUBLIC_API_URL=https://dentiflow.site
```

Redeploy from GitHub Actions so the frontend image is rebuilt with the HTTPS public API URL.

Renewal test:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml run --rm certbot renew --dry-run
```

Manual renewal command:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml run --rm certbot renew
docker compose --env-file .env.prod -f docker-compose.deploy.yml exec nginx nginx -s reload
```

On the VM, if another host-level Nginx or Apache process already owns port `80`, stop it before starting the Docker stack:

```bash
sudo ss -tulpn | grep ':80'
sudo systemctl stop nginx apache2
sudo systemctl disable nginx apache2
```

## Domain And HTTPS Presentation Summary

This is the presentation-friendly sequence used to publish DentiFlow securely:

1. Bought the domain `dentiflow.site` from IONOS.
2. Added DNS `A` records in IONOS to point the domain and subdomains to the Azure VPS public IP `68.221.171.244`:

```text
A   @     68.221.171.244
A   www   68.221.171.244
A   app   68.221.171.244
A   api   68.221.171.244
```

3. Added Dockerized Nginx as the public reverse proxy. Instead of exposing the frontend on `3000` and API gateway on `3001`, users access the app through Nginx on standard web ports:

```text
80  -> HTTP
443 -> HTTPS
```

4. Opened the required network ports in Azure Network Security Group and Ubuntu UFW:

```text
22  SSH
80  HTTP
443 HTTPS
```

5. Added a Certbot Docker service and shared volumes:

```text
certbot_www -> temporary Let's Encrypt challenge files
letsencrypt -> generated SSL certificates
```

6. Configured Nginx to serve the Let's Encrypt HTTP challenge path:

```text
/.well-known/acme-challenge/*
```

This allowed Let's Encrypt to verify that the VPS controls `dentiflow.site`.

7. Requested a Let's Encrypt certificate for:

```text
dentiflow.site
www.dentiflow.site
app.dentiflow.site
api.dentiflow.site
```

Certbot generated:

```text
/etc/letsencrypt/live/dentiflow.site/fullchain.pem
/etc/letsencrypt/live/dentiflow.site/privkey.pem
```

8. Switched Nginx to the HTTPS config. The final Nginx behavior is:

```text
http://dentiflow.site  -> redirects to https://dentiflow.site
https://dentiflow.site -> proxies to frontend:3000
```

The API gateway remains internal and is reached through the frontend BFF or the debug health alias:

```text
https://dentiflow.site/api-gateway/health -> api-gateway:3001/health
```

9. Updated production environment variables and GitHub Actions variable to use the HTTPS URL:

```env
FRONTEND_URL=https://dentiflow.site
NEXTAUTH_URL=https://dentiflow.site
NEXT_PUBLIC_API_URL=https://dentiflow.site
PROD_NEXT_PUBLIC_API_URL=https://dentiflow.site
```

10. Verified the final deployment:

```text
https://dentiflow.site works
http://dentiflow.site redirects to HTTPS
https://dentiflow.site/api-gateway/health returns {"status":"ok"}
```

Short presentation wording:

```text
We bought a domain name, pointed its DNS records to the Azure VPS, added Nginx as a Docker reverse proxy, opened ports 80 and 443, used Certbot with Let's Encrypt to generate SSL certificates, configured Nginx to redirect HTTP to HTTPS and serve the app securely, then updated the production environment and GitHub Actions variables to use https://dentiflow.site.
```

Re-run one-shot migration containers:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml rm -f db-bootstrap auth-migrations clinic-migrations patient-migrations appointment-migrations treatment-migrations
docker compose --env-file .env.prod -f docker-compose.deploy.yml up -d --no-build --remove-orphans
```

