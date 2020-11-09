#!/bin/bash

docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user carrier --password carrier \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update realms/master -s sslRequired=NONE \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update realms/carrier -s sslRequired=NONE \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh create groups -r carrier -s name=superadmin \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh create groups -r carrier -s name=grafana \
&& groupid=`docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh get groups -r carrier | grep id | cut -d: -f2 | sed s/' '//g | sed s/'"'//g | sed s/','//g` \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update users/8a9a3cec-5e13-42cd-8736-a0e97598d86e/groups/${groupid:0:36} -r carrier -s realm=carrier -s userId=8a9a3cec-5e13-42cd-8736-a0e97598d86e -s groupId=${groupid:0:36} -n \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update users/8a9a3cec-5e13-42cd-8736-a0e97598d86e/groups/${groupid:37:72} -r carrier -s realm=carrier -s userId=8a9a3cec-5e13-42cd-8736-a0e97598d86e -s groupId=${groupid:37:72} -n \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update realms/carrier -s "loginTheme=carrier"

docker cp grafana/datasources/. carrier-grafana:/etc/grafana/provisioning/datasources
docker cp grafana/def.yml carrier-grafana:/etc/grafana/provisioning/dashboards
docker cp grafana/dashboards/. carrier-grafana:/etc/grafana/provisioning/dashboards
docker restart carrier-grafana

docker exec carrier-influx bash -c "influx -execute \"create user admin with password 'password' with all privileges;\""
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database jmeter WITH DURATION 180d REPLICATION 1 SHARD DURATION 7d NAME autogen'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database comparison WITH DURATION 180d REPLICATION 1 SHARD DURATION 7d NAME autogen'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database gatling WITH DURATION 180d REPLICATION 1 SHARD DURATION 7d NAME autogen'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database telegraf WITH DURATION 180d REPLICATION 1 SHARD DURATION 7d NAME autogen'"
