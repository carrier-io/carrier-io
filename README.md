# Carrier | Continuous test execution platform



## Standalone Deployment on server with Docker Installed

### Prerequisites

Install docker and docker-compose on machine you want carrier to be installed

Ports required for minimal installation to work:

80 - basic port where Galloper will be serving

8086 - InfluxDB port

3100 - Loki port for logs aggregartion

4444 - WebDriver port for UI performance

9999 - UI performance control API port (this one will be changed to FaaS in next builds)

Note: In order to use different port for Traefik statistic interface (:8080) you may want to specify ` -e TRAEFIK_STATS_PORT=<your_port> ` while starting installation container

### Installing Carrier instance

We deprecated an installer container. It will be back in future releases.

Currently in order to install carrier you need to copy everything from `carrier-io/dev` directory to the place you are planning to have major components store it's data (some persistent storage)

Modify configurations stored in `.env` file. You'd need to modify APP_HOST and CARRIER_PATH to make it work. 

`APP_HOST` is URL of your machine including protocol (e.g. http://server)  

`CARRIER_PATH` is the path on your machine where you saved content of `dev` folder

run `docker-compose up -d` within `dev` folder

after some time (required for all objects to boot 1-2 minutes) you can access your deployment through browser

default login is `user` with password `user`

to configure auth you need to access http://YOUR_IP/auth/admin and use credentials `carrier\carrier`

### CURRENTLY IT IS WORK IN PROGRESS. PLEASE use :sqlite_edition branch for couple of days :D


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


## Uninstall Carrier

1. Run the docker command
   
   `docker run -it --rm -p 9999:9999 -v //var/run/docker.sock://var/run/docker.sock getcarrier/carrier-io:latest`

2. Open `http://localhost:9999/uninstall` in your browser
