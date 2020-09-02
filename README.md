# Carrier | Continuous test execution platform

### Prerequisites 

Ports required for minimal installation to work:

80/443 - basic port where Galloper will be serving

8086 - InfluxDB port

3100 - Loki port for logs aggregartion

4444 - WebDriver port for UI performance

6379 - Redis for Celery

### Installing Carrier instance
Installer is back, which is good news, we are adding features to it, currently it works with following assumptions:
1. Installation is always happens to /opt/carrier
2. Grafana should be configured manually if required (adding datasources and dashboards)

#### Local installation:

1. Run the docker command: 
`docker run -it -v /opt:/opt -v /var/run/docker.sock:/var/run/docker.sock -p 1337:1337 getcarrier/installer`

2. Open http://localhost:1337/ in your browser

3. Choose local

#### Other installation:

1. Run the docker command: 
`docker run -it -p 1337:1337 getcarrier/installer`

2. Open http://localhost:1337/ in your browser
3. Choose your preferred option

#### Clouds

##### AWS:
Provide AWS key pairs, AWS Access Key Id, AWS Secret Key, Region, Virtual Machine, Operating System.

##### GCP:
Provide Google Cloud Platform credentials (json file), Google Cloud Platform Account Name, Region, Virtual Machine, Operating System.

##### AZURE:
Login to https://microsoft.com/devicelogin and type device CODE that provided you on installation page.
Choose your Region, Virtual Machine type and Operating System.

## Configuration of interceptor (scale unit)

As easy as export couple of vars and run a single container

```
export REDIS_PASSWORD=password
export CPU_CORES=`nproc --all`
export FULLHOST=<hostname of carrier>

docker run -d --rm -v /var/run/docker.sock:/var/run/docker.sock \
	   -e CPU_CORES=$CPU_CORES -e REDIS_PASSWORD=$REDIS_PASSWORD \
     -e REDIS_HOST=$FULLHOST getcarrier/interceptor:latest
```
       
## Minimal System Requirements

Server | CPU | RAM | HDD
------- | ---- | ---- | ----
carrier | 4 | 16Gb | 200Gb
interceptor | 1 | 3Gb | 20Gb
