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

For the current Azure IP:

```text
PROD_NEXT_PUBLIC_API_URL=http://68.221.171.244:3001
PROD_NEXT_PUBLIC_DEFAULT_CLINIC_ID=00000000-0000-4000-8000-000000000001
```

## VPS/VM Files

The VM should contain:

```text
/opt/dentiflow/.env.prod
/opt/dentiflow/docker-compose.deploy.yml
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

FRONTEND_URL=http://68.221.171.244:3000
NEXTAUTH_URL=http://68.221.171.244:3000
NEXT_PUBLIC_API_URL=http://68.221.171.244:3001
NEXT_PUBLIC_DEFAULT_CLINIC_ID=00000000-0000-4000-8000-000000000001

DENTIFLOW_SEED_DEFAULT_ADMIN=true
DEFAULT_ADMIN_CLINIC_ID=00000000-0000-4000-8000-000000000001
DEFAULT_ADMIN_EMAIL=admin@dentiflow.local
DEFAULT_ADMIN_PASSWORD=Admin123!
DEFAULT_ADMIN_FULL_NAME=DentiFlow Admin

PROD_BIND_ADDRESS=0.0.0.0
PROD_FRONTEND_PORT=3000
PROD_API_PORT=3001
```

## Azure Network Requirements

Azure inbound security rules must allow:

- TCP `22`
- TCP `3000`
- TCP `3001`

Ubuntu UFW should also allow:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw status
```

## Health Checks

Browser:

```text
http://68.221.171.244:3000
http://68.221.171.244:3001/health
```

From VM:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml ps
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

Re-run one-shot migration containers:

```bash
cd /opt/dentiflow
docker compose --env-file .env.prod -f docker-compose.deploy.yml rm -f db-bootstrap auth-migrations clinic-migrations patient-migrations appointment-migrations treatment-migrations
docker compose --env-file .env.prod -f docker-compose.deploy.yml up -d --no-build --remove-orphans
```

