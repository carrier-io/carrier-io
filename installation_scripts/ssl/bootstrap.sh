#!/bin/bash

docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user carrier --password carrier \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update realms/master -s sslRequired=NONE \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update realms/carrier -s sslRequired=NONE \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh create groups -r carrier -s name=superadmin \
&& groupid=`docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh get groups -r carrier | grep id | cut -d: -f2 | sed s/' '//g | sed s/'"'//g | sed s/','//g` \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update users/8a9a3cec-5e13-42cd-8736-a0e97598d86e/groups/${groupid} -r carrier -s realm=carrier -s userId=8a9a3cec-5e13-42cd-8736-a0e97598d86e -s groupId=${groupid} -n \
&& docker exec carrier-keycloak /opt/jboss/keycloak/bin/kcadm.sh update realms/carrier -s "loginTheme=carrier"

docker exec carrier-influx bash -c "influx -execute \"create user admin with password 'password' with all privileges;\""
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database jmeter'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database comparison'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database gatling'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database prodsec'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database perfui'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database telegraf'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database thresholds'"
docker exec carrier-influx bash -c "influx -username 'admin' -password 'password' -execute 'create database profiling'"
