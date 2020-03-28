from os import environ, path, getcwd
import json


def realm_load():
    with open(f'{WORKDIR}/data/keycloak_realm.json') as f:
        return json.load(f)

TRAEFIK_STATS_PORT = environ.get("TRAEFIK_STATS_PORT", "8080")
TRAEFIK_PUBLIC_PORT = environ.get("TRAEFIK_PUBLIC_PORT", "80")

WORKDIR = "/tmp/carrier"
DATA_FILES_DIR = path.join(path.dirname(__file__), "data")
ENV_FILES_DIR = path.join(path.dirname(__file__), "env_files")

USERNAME = "carrier"
REDIS_PASSWORD = "password"
GROUPNAME = "carrier"
GROUPID = "1001"
USERID = "1001"
JENKINS_HOME = "/var/jenkins_home"
POSTGRES_ENTRYPOINT_FILENAME = "postgres-entrypoint.sh"
CARRIER_AUTH_FILENAME = "settings.yaml"
KEYCLOAK_REALM_FILENAME = "keycloak_realm_data.json"

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

CARRIERAUTHFILE = f"""FROM lifedjik/traefik-forward-auth-saml:0.1
ADD {CARRIER_AUTH_FILENAME} /config/{CARRIER_AUTH_FILENAME}
"""

KEYCLOAKREALMFILE = f"""FROM jboss/keycloak:latest
ADD {KEYCLOAK_REALM_FILENAME} /realm/data/{KEYCLOAK_REALM_FILENAME}
"""

INFLUXFILE = '''FROM influxdb:1.7
ADD influxdb.conf /etc/influxdb/influxdb.conf
EXPOSE 8086
EXPOSE 2003
'''

TRAEFICFILE = '''
FROM traefik:cantal
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

TRAEFIC_CONFIG = '''
[providers.docker]
  endpoint = "unix:///var/run/docker.sock"
  exposedByDefault = false
  network = "carrier"

[api]
  dashboard = true
[ping]
  manualRouting = true

[entryPoints]
  [entryPoints.http]
    address = ":80"
    [entryPoints.http.forwardedHeaders]
      insecure = true
'''

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
      GF_PANELS_DISABLE_SANITIZE_HTML: "true"
      GF_INSTALL_PLUGINS: "natel-influx-admin-panel"
      GF_SECURITY_ADMIN_PASSWORD: {password}
      GF_SERVER_ROOT_URL: http://{host}/grafana
      GF_SERVER_SERVE_FROM_SUB_PATH: "true"
      GF_SECURITY_ADMIN_USER: "user"
      GF_SECURITY_DISABLE_GRAVATAR: "true"
      GF_SECURITY_ALLOW_EMBEDDING: "true"
      GF_AUTH_DISABLE_LOGIN_FORM: "true"
      GF_AUTH_SIGNOUT_REDIRECT_URL: "http://localhost/logout"
      GF_AUTH_PROXY_ENABLED: "true"
      GF_AUTH_PROXY_HEADER_NAME: X-WEBAUTH-USER
      GF_AUTH_PROXY_HEADER_PROPERTY: username
      GF_AUTH_PROXY_HEADERS: "Name:X-WEBAUTH-NAME Email:X-WEBAUTH-EMAIL"
      GF_AUTH_PROXY_AUTO_SIGN_UP: "true"
    networks:
      - carrier
    container_name: carrier-grafana
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.grafana.rule=PathPrefix(`/grafana`)'
      - 'traefik.http.services.grafana.loadbalancer.server.port=3000'
      - 'traefik.http.middlewares.grafana-auth.forwardauth.address=http://carrier-auth:80/forward-auth/auth?target=header&scope=grafana'
      - 'traefik.http.middlewares.grafana-auth.forwardauth.authResponseHeaders=X-WEBAUTH-USER, X-WEBAUTH-NAME, X-WEBAUTH-EMAIL'
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

CARRIER_AUTH_COMPOSE = """
  carrier-auth:
    build: {path}
    restart: unless-stopped
    container_name: carrier-auth
    networks:
      - carrier
    environment:
      CONFIG_FILENAME: "/config/settings.yaml"
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.carrier-auth.rule=PathPrefix(`/forward-auth`)'
      - 'traefik.http.services.carrier-auth.loadbalancer.server.port=80'
"""

KEYCLOAK_COMPOSE = """
  keycloak:
    build: {path}
    restart: unless-stopped
    container_name: carrier-keycloak
    networks:
      - carrier
    depends_on:
      - postgres
    environment:
      KEYCLOAK_USER: "carrier"
      KEYCLOAK_PASSWORD: "carrier"
      KEYCLOAK_IMPORT: realm/data/keycloak_realm_data.json
      DB_VENDOR: "postgres"
      DB_ADDR: "postgres"
      DB_DATABASE: "carrier_pg_db"
      DB_USER: "carrier_pg_user"
      DB_SCHEMA: "keycloak"
      DB_PASSWORD: "carrier_pg_password"
      PROXY_ADDRESS_FORWARDING: "true"
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.keycloak.rule=PathPrefix(`/auth`)'
      - 'traefik.http.services.keycloak.loadbalancer.server.port=8080'
      - 'carrier=keycloak'
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
      - 'traefik.enable=true'
      - 'traefik.http.routers.galloper.rule=PathPrefix(`/`)'
      - 'traefik.http.services.galloper.loadbalancer.server.port=5000'
      - 'traefik.http.middlewares.galloper-auth.forwardauth.address=http://carrier-auth:80/forward-auth/auth?target=json&scope=galloper'
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

CARRIER_AUTH_SETTINGS = """
global:
  debug: false
  disable_auth: false

server:
  global:
    environment: production
    engine.signals.on: true
    server.socket_host: 0.0.0.0
    server.socket_port: 80
    server.thread_pool: 8
    server.max_request_body_size: 0
    server.socket_timeout: 60

  "/":
    tools.sessions.on: true
    tools.sessions.name: auth_session_id
    tools.sessions.domain: localhost
    tools.sessions.httponly: true
    tools.sessions.secure: false
    tools.proxy.on: true
    tools.proxy.local: Host
    tools.secureheaders.on: true
    tools.staticdir.on: true
    tools.staticdir.dir: static


endpoints:
  root: "/forward-auth/"
  saml: "/forward-auth/saml"
  oidc: "/forward-auth/oidc"
  info: "/forward-auth/info"
  access_denied: "/access_denied"


auth:
  auth_redirect: "http://localhost/forward-auth/login"
  login_handler: "/forward-auth/oidc/login"
  logout_handler: "/forward-auth/oidc/logout"
  # login_handler: "/forward-auth/saml/login"
  # logout_handler: "/forward-auth/saml/logout"
  login_default_redirect_url: http://localhost/
  logout_default_redirect_url: http://localhost/
  logout_allowed_redirect_urls:
  - http://localhost/


mappers:
  header:
    grafana:
      X-WEBAUTH-USER: "'auth_attributes'.'preferred_username'"
      X-WEBAUTH-NAME: "'auth_attributes'.'name'"
      X-WEBAUTH-EMAIL: "'auth_attributes'.'email'"
  json:
    galloper:
      login: "'auth_attributes'.'preferred_username'"
      name: "'auth_attributes'.'name'"
      email: "'auth_attributes'.'email'"


saml:
  strict: false
  debug: false

  sp:
    entityId: carrier-saml
    assertionConsumerService:
      url: http://localhost/forward-auth/saml/acs
      binding: urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST
    singleLogoutService:
      url: http://localhost/forward-auth/saml/sls
      binding: urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST
    NameIDFormat: urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified
    x509cert: ${KEYCLOAK_SP_CERT}
    privateKey: ${KEYCLOAK_PRIVATE_KEY}

  idp:
    entityId: http://localhost/auth/realms/test
    singleSignOnService:
      url: http://localhost/auth/realms/test/protocol/saml
      binding: urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST
    singleLogoutService:
      url: http://localhost/auth/realms/test/protocol/saml
      binding: urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST
    x509cert: ${KEYCLOAK_IDP_CERT}

  security:
    authnRequestsSigned: true
    logoutRequestSigned: true
    signatureAlgorithm: http://www.w3.org/2001/04/xmldsig-more#rsa-sha256
    digestAlgorithm: http://www.w3.org/2001/04/xmlenc#sha256


oidc:
  debug: true

  provider:
    configuration:
      issuer: "http://localhost/auth/realms/test"
      authorization_endpoint: "http://localhost/auth/realms/test/protocol/openid-connect/auth"
      token_endpoint: "http://keycloak:8080/auth/realms/test/protocol/openid-connect/token"
      token_introspection_endpoint: "http://localhost/auth/realms/test/protocol/openid-connect/token/introspect"
      userinfo_endpoint: "http://keycloak:8080/auth/realms/test/protocol/openid-connect/userinfo"
      end_session_endpoint: "http://localhost/auth/realms/test/protocol/openid-connect/logout"
      jwks_uri: "http://keycloak:8080/auth/realms/test/protocol/openid-connect/certs"
      check_session_iframe: "http://localhost/auth/realms/test/protocol/openid-connect/login-status-iframe.html"
      grant_types_supported: ["authorization_code","implicit","refresh_token","password","client_credentials"]
      response_types_supported: ["code","none","id_token","token","id_token token","code id_token","code token","code id_token token"]
      subject_types_supported: ["public","pairwise"]
      id_token_signing_alg_values_supported: ["PS384","ES384","RS384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512"]
      id_token_encryption_alg_values_supported: ["RSA-OAEP","RSA1_5"]
      id_token_encryption_enc_values_supported: ["A128GCM","A128CBC-HS256"]
      userinfo_signing_alg_values_supported: ["PS384","ES384","RS384","HS256","HS512","ES256","RS256","HS384","ES512","PS256","PS512","RS512","none"]
      request_object_signing_alg_values_supported: ["PS384","ES384","RS384","ES256","RS256","ES512","PS256","PS512","RS512","none"]
      response_modes_supported: ["query","fragment","form_post"]
      registration_endpoint: "http://localhost/auth/realms/test/clients-registrations/openid-connect"
      token_endpoint_auth_methods_supported: ["private_key_jwt","client_secret_basic","client_secret_post","tls_client_auth","client_secret_jwt"]
      token_endpoint_auth_signing_alg_values_supported: ["PS384","ES384","RS384","ES256","RS256","ES512","PS256","PS512","RS512"]
      claims_supported: ["aud","sub","iss","auth_time","name","given_name","family_name","preferred_username","email","acr"]
      claim_types_supported: ["normal"]
      claims_parameter_supported: False
      scopes_supported: ["openid","offline_access","profile","email","address","phone","roles","web-origins","microprofile-jwt"]
      request_parameter_supported: True
      request_uri_parameter_supported: True
      code_challenge_methods_supported: ["plain","S256"]
      tls_client_certificate_bound_access_tokens: True
      introspection_endpoint: "http://localhost/auth/realms/test/protocol/openid-connect/token/introspect"

    registration:
      client_id: carrier-oidc
      client_secret: 565c7a98-0f30-4acf-8dcd-e8c0fe7df06e
      redirect_uris:
      - "http://localhost/forward-auth/oidc/callback"
      post_logout_redirect_uris:
      - "http://localhost"

"""
