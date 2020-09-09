#!/bin/bash

set -e
set -u

# create schema within database
docker_setup_schema() {
  local schema=$1
  if [ "$schema" != 'public' ]; then
    echo "Creating database schema '$schema' for user '$POSTGRES_USER'"
		psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c  "CREATE SCHEMA IF NOT EXISTS \"$schema\" AUTHORIZATION \"$POSTGRES_USER\";"
	fi
}

if [ -n "$POSTGRES_SCHEMAS" ]; then
	echo "Multiple schemas creation requested: '$POSTGRES_SCHEMAS'"
	for schema in $(echo "$POSTGRES_SCHEMAS" | tr ',' ' '); do
		docker_setup_schema "$schema"
	done
	echo "Multiple schemas created"
fi

# Vault
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE vault_kv_store (
      parent_path TEXT COLLATE "C" NOT NULL,
      path        TEXT COLLATE "C",
      key         TEXT COLLATE "C",
      value       BYTEA,
      CONSTRAINT pkey PRIMARY KEY (path, key)
    );
    CREATE INDEX parent_path_idx ON vault_kv_store (parent_path);
EOSQL
