-- =============================================================================
-- DentiFlow – per-service database bootstrap
-- =============================================================================
-- MySQL executes every *.sql file inside /docker-entrypoint-initdb.d/
-- in alphabetical order, but ONLY on the very first container start
-- (i.e. when the data volume is empty).
--
-- Pattern: Database-per-Service
--   Each microservice owns exactly one database schema.
--   Services must NEVER query another service's schema directly;
--   they communicate through the API Gateway / gRPC / events.
--
-- How to add a new service:
--   1. Add:  CREATE DATABASE IF NOT EXISTS `<service>_db` ...
--   2. Re-create the db volume (docker compose down -v && docker compose up -d)
--      OR run the CREATE DATABASE manually while the container is running.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Auth Service
-- ---------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `auth_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Grant root access from any host so the service container can connect.
-- In production, replace root with a least-privilege service account and
-- restrict the host to the internal Docker network CIDR.
GRANT ALL PRIVILEGES ON `auth_db`.* TO 'root'@'%';

-- ---------------------------------------------------------------------------
-- (Future services — uncomment and extend when the service is added)
-- ---------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `clinic_db`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `clinic_db`.* TO 'root'@'%';

-- CREATE DATABASE IF NOT EXISTS `appointment_db`
--   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- GRANT ALL PRIVILEGES ON `appointment_db`.* TO 'root'@'%';

-- CREATE DATABASE IF NOT EXISTS `notification_db`
--   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- GRANT ALL PRIVILEGES ON `notification_db`.* TO 'root'@'%';

FLUSH PRIVILEGES;
