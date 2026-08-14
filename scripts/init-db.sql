-- init-db.sql - Database initialization for local development
-- This runs automatically when the postgres container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a test client database
-- In production, each client gets their own database via the provisioning script

-- Create dev user with permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'perissos') THEN
        CREATE ROLE perissos WITH LOGIN PASSWORD 'perissos_dev_password' CREATEDB;
    END IF;
END $$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE perissos_dev TO perissos;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO perissos;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO perissos;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO perissos;

-- Create a sample client database for testing
SELECT 'CREATE DATABASE perissos_client_demo'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'perissos_client_demo')\gexec

-- Grant permissions on demo database
GRANT ALL PRIVILEGES ON DATABASE perissos_client_demo TO perissos;
