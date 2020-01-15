# Carrier | Continuous test execution platform



## Standalone Deployment on server with Docker Installed

### Installing Carrier instance (web UI based, seems less reliable for now - see CLI method in the bottom of the page).

1. Run the docker command
   
   `docker run -it --rm -p 9999:9999 -v <local folder for docker-compose>://opt/carrier -v //var/run/docker.sock://var/run/docker.sock getcarrier/carrier-io:latest`

2. Open `http://localhost:9999` in your browser

3. Fill IP and amount of worker slots you want be available on this server 

   Mark all images you want to be pre-fetched on particular server (jMeter, Gatling, SAST and DAST) 

4. Fill Grafana Admin password on second screen

5. Review comfiguration and proceed with installation

6. Once installation is done you will see `Installation complete ...` message in log trace area

Jenkins will is available at `<public_dns>/jenkins` (only in case you choose an option to install it)

Grafana will is available at `<public_dns>/grafana` (only in case you choose an option to install it)  
 

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
