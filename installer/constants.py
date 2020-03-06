from os import environ, path

TRAEFIK_STATS_PORT = environ.get("TRAEFIK_STATS_PORT", "8080")
TRAEFIK_PUBLIC_PORT = environ.get("TRAEFIK_PUBLIC_PORT", "80")

WORKDIR = "/opt/carrier"
ENTRY_POINTS_DIR = path.join(path.dirname(__file__), "entry_points")
ENV_FILES_DIR = path.join(path.dirname(__file__), "env_files")

USERNAME = "carrier"
REDIS_PASSWORD = "password"
GROUPNAME = "carrier"
GROUPID = "1001"
USERID = "1001"
JENKINS_HOME = "/var/jenkins_home"
POSTGRES_ENTRYPOINT_FILENAME = "postgres-entrypoint.sh"

# Name of volumes
INFLUX_VOLUME_NAME = "carrier_influx_volume"
GRAFANA_VOLUME_NAME = "carrier_grafana_volume"
JENKINS_VOLUME_NAME = "carrier_jenkins_volume"
VAULT_VOLUME_NAME = "carrier_vault_volume"
MINIO_VOLUME_NAME = "carrier_minio_volume"
GALLOPER_REPORTS_VOLUME = "carrier_reports_volume"
POSTGRES_DB_VOLUME = "carrier_pg_db_volume"

# S3 buckets to create
BUCKETS = [
    'reports',
    'tests'
]

# Dockerfiles
JENKINSFILE = f"""FROM jenkins/jenkins:lts
USER root
RUN apt-get -qq update && apt-get install -y --no-install-recommends \\
     apt-transport-https ca-certificates curl gnupg2 software-properties-common
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN apt-key fingerprint 0EBFCD88
RUN echo "deb [arch=amd64] https://download.docker.com/linux/debian \\
     stretch stable" | \\
	 tee /etc/apt/sources.list.d/docker.list
RUN apt-get -qq update && apt-get install -y --no-install-recommends docker-ce
RUN chown -R {GROUPID}:{GROUPID} $JENKINS_HOME
RUN groupadd --gid {GROUPID} {GROUPNAME}
RUN adduser --home {JENKINS_HOME} --ingroup {GROUPNAME} --disabled-password --shell /bin/bash --gecos '' {USERNAME}
ENV JENKINS_OPTS --prefix=/jenkins
ENV JAVA_OPTS -Djenkins.install.runSetupWizard=false
RUN chown -R {USERNAME}:{GROUPNAME} $JENKINS_HOME
RUN userdel jenkins
RUN chown -R {USERNAME} {JENKINS_HOME} /usr/share/jenkins/ref && \\
	chown {USERNAME} /usr/local/bin/jenkins-support && \\
	chown {USERNAME} /usr/local/bin/jenkins.sh && \\
	chown {USERNAME} /bin/tini
RUN /usr/local/bin/install-plugins.sh job-dsl durable-task git cloudbees-folder \\
                                      credentials credentials-binding timestamper \\
                                      workflow-aggregator workflow-cps pipeline-build-step \\
                                      Parameterized-Remote-Trigger publish-over-cifs \\
                                      email-ext ws-cleanup junit performance htmlpublisher || \\
                                      echo 'You would need to configure jenkins before running the tests'
EXPOSE 8080
"""

POSTGRESFILE = f"""FROM postgres:12.2
ADD {POSTGRES_ENTRYPOINT_FILENAME} /docker-entrypoint-initdb.d/postgres-entrypoint.sh
"""

INFLUXFILE = '''FROM influxdb:1.7
ADD influxdb.conf /etc/influxdb/influxdb.conf
EXPOSE 8086
EXPOSE 2003
'''

TRAEFICFILE = '''
FROM traefik:1.7
ADD traefik.toml /etc/traefik/traefik.toml
EXPOSE 8080
EXPOSE 80
'''

# Config files

INFLUX_CONF = '''[meta]
  dir = "/var/lib/influxdb/meta"

[data]
  dir = "/var/lib/influxdb/data"
  engine = "tsm1"
  wal-dir = "/var/lib/influxdb/wal"

[subscriber]
[[graphite]]
  enabled = true
  database = "gatling"
  bind-address = ":2003"
  protocol = "tcp"
  consistency-level = "one"
  separator = "."

templates = [
"*.*.*.*.users.*.* test_type.env.user_count.simulation.measurement.user_type.field",
"*.*.*.*.*.*.count measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.max measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.mean measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.min measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.percentiles50 measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.percentiles75 measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.percentiles95 measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.percentiles99 measurement.env.user_count.simulation.request_name.status.field",
"*.*.*.*.*.*.stdDev measurement.env.user_count.simulation.request_name.status.field"
]

[http]
enabled=true
bind-address=":8086"
'''

TRAEFIC_CONFIG = '''################################################################
# API and dashboard configuration
################################################################
[api]
################################################################
# Docker configuration backend
################################################################
[docker]
domain = "docker.local"
watch = true'''

# Compose pieces

DOCKER_COMPOSE = """version: '3'
services:
"""

JENKINS_COMPOSE = """  jenkins:
    build: {path}
    restart: unless-stopped
    depends_on:
      - traefik
    volumes:
      - {volume}:/var/jenkins_home
      - //var/run/docker.sock://var/run/docker.sock
    networks:
      - carrier
    labels:
      - 'traefik.backend=jenkins'
      - 'traefic.port=8080'
      - 'traefik.frontend.rule=PathPrefix: /jenkins'
      - 'traefik.frontend.passHostHeader=true'
      - 'carrier=jenkins'
"""

VAULT_COMPOSE = """  vault:
    image: vault:1.1.0
    restart: unless-stopped
    environment:
      - 'VAULT_DEV_ROOT_TOKEN_ID=vault_token' 
      - 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200'
      - 'VAULT_LOCAL_CONFIG={"backend": {"file": {"path": "/vault/file"}}, "default_lease_ttl": "168h", "max_lease_ttl": "720h"}'
    cap_add:
      - IPC_LOCK
    volumes:
      - %s:/vault
    ports:
      - 8200:8200
    networks:
      - carrier
    container_name: carrier-vault
    labels:
      - 'traefik.enable=false'
      - 'carrier=vault'
"""

INFLUX_COMPOSE = '''  influx:
    build: {path}
    restart: unless-stopped
    volumes:
      - {volume}:/var/lib/influxdb/data
    networks:
      - carrier
    ports:
      - 2003:2003
      - 8086:8086
    labels:
      - 'traefik.enable=false'
      - 'carrier=influx'
    container_name: carrier-influx
'''

GRAFANA_COMPOSE = '''  grafana:
    image: grafana/grafana:6.4.4
    restart: unless-stopped
    volumes:
      - {volume}:/var/lib/grafana
    environment:
      - GF_PANELS_DISABLE_SANITIZE_HTML=true
      - GF_INSTALL_PLUGINS=natel-influx-admin-panel
      - GF_SECURITY_ADMIN_PASSWORD={password}
      - GF_SERVER_ROOT_URL=http://{host}/grafana
    networks:
      - carrier
    container_name: carrier-grafana
    labels:
      - 'traefik.backend=grafana'
      - 'traefic.port=3000'
      - 'traefik.frontend.rule=PathPrefixStrip: /grafana'
      - 'traefik.frontend.passHostHeader=true'
      - 'carrier=grafana'
    user: root
  loki:
    image: grafana/loki:latest
    restart: unless-stopped
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    container_name: carrier-loki
    networks:
      - carrier
    labels:
      - 'traefik.enable=false'
      - 'carrier=loki'
'''

TRAEFIC_COMPOSE = """  traefik:
    build: {path}
    restart: unless-stopped
    volumes:
      - //var/run/docker.sock://var/run/docker.sock
    networks:
      - carrier
    container_name: carrier-traefik
    labels:
        - 'carrier=traefik'
    ports:
      - {TRAEFIK_STATS_PORT}:8080
      - {TRAEFIK_PUBLIC_PORT}:80
"""

POSTGRES_COMPOSE = """
  postgres:
    build: {path}
    restart: unless-stopped
    container_name: carrier-postgres
    volumes:
      - {volume}:/var/lib/postgresql/data
    networks:
      - carrier
    env_file:
     - ./env_files/postgres.env
    environment:
      - POSTGRES_SCHEMAS=carrier,keycloak
      - POSTGRES_INITDB_ARGS=--data-checksums
    labels:
      - 'traefik.enable=false'
      - 'carrier=postgres' 
"""

REDIS_COMPOSE = """  
  redis:
    image: redis:5.0.3
    restart: unless-stopped
    ports:
      - 6379:6379
    labels:
      - 'traefik.enable=false'
      - 'carrier=redis'
    container_name: carrier-redis
    networks:
      - carrier
    entrypoint:
      - redis-server
      - --requirepass
      - {password}
  keycloak:
    image: jboss/keycloak:latest
    restart: unless-stopped
    container_name: carrier-keycloak
    volumes:
    - ./client_secrets.json:/tmp/auth
    networks:
      - carrier
    depends_on:
      - postgres
    environment:
      KEYCLOAK_USER: "carrier"
      KEYCLOAK_PASSWORD: "carrier"
      DB_VENDOR: "postgres"
      DB_ADDR: "postgres"
      DB_DATABASE: "carrier_pg_db"
      DB_USER: "carrier_pg_user"
      DB_SCHEMA: "keycloak"
      DB_PASSWORD: "carrier_pg_password"
      PROXY_ADDRESS_FORWARDING: "true"
    labels:
      - 'traefik.backend=keycloak'
      - 'traefik.frontend.rule=PathPrefix: /auth'
      - 'traefic.port=8099'
      - 'traefik.frontend.passHostHeader=true'
      - 'carrier=keycloak'
  galloper:
    image: getcarrier/galloper:latest
    restart: unless-stopped
    volumes:
      - //var/run/docker.sock://var/run/docker.sock
      - {galloper_reports}:/tmp/reports
    networks:
      - carrier
    links:
      - "redis:redis"
    container_name: carrier-galloper
    env_file:
     - ./env_files/postgres.env
    environment:
      - REDIS_DB=2
      - REDIS_HOST=carrier-redis
      - CPU_CORES=1
      - APP_HOST=http://{host}
      - MINIO_HOST=http://carrier-minio:9000
      - MINIO_ACCESS_KEY=admin
      - MINIO_SECRET_KEY=password
      - MINIO_REGION=us-east-1
      - POSTGRES_SCHEMA=carrier
      - POSTGRES_HOST=postgres
    depends_on:
      - redis
      - minio
      - postgres
    expose:
      - "5000"
    labels:
      - 'traefik.backend=galloper'
      - 'traefic.port=5000'
      - 'traefik.frontend.rule=PathPrefix: /'
      - 'traefik.frontend.passHostHeader=true'
      - 'carrier=galloper' 
  minio:
    image: minio/minio:RELEASE.2019-10-12T01-39-57Z
    restart: unless-stopped
    networks:
      - carrier
    environment:
      - MINIO_ACCESS_KEY=admin
      - MINIO_SECRET_KEY=password
    volumes:
      - {minio_volume}:/data
    labels:
      - 'traefik.enable=false'
      - 'carrier=minio'
    container_name: carrier-minio
    command: server /data
  interceptor:
    image: getcarrier/interceptor:latest
    restart: unless-stopped
    container_name: interceptor
    networks:
      - carrier
    labels:
      - 'traefik.enable=false'
      - 'carrier=interceptor'
    depends_on:
      - redis
    volumes:
      - //var/run/docker.sock://var/run/docker.sock
    environment:
      - CPU_CORES={cpu_cores}
      - REDIS_PASSWORD={password}
      - REDIS_HOST={host}
  observer_chrome:
    image: getcarrier/observer-chrome:latest
    restart: unless-stopped
    networks:
      - carrier
    ports:
      - 4444:4444
    container_name: observer-chrome
    labels:
      - 'traefik.enable=false'
      - 'carrier=chrome'
"""

NETWORK_PIECE = """\nnetworks:
  carrier:
    external: true
"""

POSTGRES_ENTRYPOINT = """
#!/bin/bash

set -e
set -u

# create schema within database
docker_setup_schema() {
  local schema=$1
  if [ "$schema" != 'public' ]; then
    echo "Creating database schema '$schema' for user '$POSTGRES_USER'"
		psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
		  CREATE SCHEMA IF NOT EXISTS "$schema" AUTHORIZATION "$POSTGRES_USER";
		EOSQL
	fi
}

if [ -n "$POSTGRES_SCHEMAS" ]; then
	echo "Multiple schemas creation requested: '$POSTGRES_SCHEMAS'"
	for schema in $(echo "$POSTGRES_SCHEMAS" | tr ',' ' '); do
		docker_setup_schema "$schema"
	done
	echo "Multiple schemas created"
fi
"""

# Seed data Jenkins
JENKINS_URL = "http://{host}/jenkins/createItem?name={job}"
JENKINS_HEADERS = {"Content-type": "application/xml"}
JENKINS_JOBS = {
    "demo_perfui": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/perfui.xml",
    "demo_perfmeter_standalone": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/"
                                 "perfmeter_standalone.xml",
    "demo_perfgun_standalone": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/"
                               "perfgun_standalone.xml",
    "demo_sast_nodejs": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/sast_nodejs.xml",
    "demo_sast_java": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/sast_java.xml",
    "demo_dast_blind": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/dast_blind.xml",
    "demo_dast_authenticated": "https://raw.githubusercontent.com/carrier-io/carrier-io/master/demo_jenkins/"
                               "dast_blind.xml"
}
INFLUX_DATABASES = [
    'jmeter',
    'comparison',
    'gatling',
    'prodsec',
    'perfui',
    'telegraf',
    'thresholds',
    'profiling'
]
INFLUX_CREATEDB_COMMAND = 'bash -c "influx -execute \'create database {db}\'"'

# Seed DataSources
DATASOURCES_HOST = "http://{host}/grafana/api/datasources"
DATASOURCES = [
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_comparison',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_jmeter',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_gatling',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_perfui',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_prodsec',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_telegraf',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/loki',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_thresholds'
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/influx_datasources/datasource_profiling'
]

# Seed data GRAFANA
GRAFANA_URL = "http://{host}/grafana/api/dashboards/db"
GRAFANA_HEADERS = {"Content-type": "application/json"}
GRAFANA_DASHBOARDS = [
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'ui_performance_dashboard.json',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'performance_comparison_dashboard.json',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'perfgun_performance_dashboard.json',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'perfmeter_dashboards.json',
    'https://raw.githubusercontent.com/carrier-io/carrier-io/master/grafana_dashboards/'
    'thresholds_dashboard.json'
]
