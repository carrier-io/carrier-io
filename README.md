# Carrier | Continuous test execution platform



## Standalone Deployment on server with Docker Installed

### Installing Carrier instance (web UI based, seems less reliable for now - see CLI method in the bottom of the page).

1. Run the docker command
   
   `docker run -it --rm -p 9999:9999 -v //var/run/docker.sock://var/run/docker.sock getcarrier/carrier-io:latest`

2. Open `http://localhost:9999` in your browser

3. Fill DNS and amount of worker slots you want be available on this server 

   Mark all images you want to be seeded (Perfmeter, Perfgun, SAST and DAST) 

   ![alt text](https://raw.githubusercontent.com/carrier-io/carrier-io/master/images/installation_step_1.png)

4. Fill Grafana and Influx data in second screen

   _Note: Leave Grafana and Influx URLs blank in case you need it filled_ 

   ![alt text](https://raw.githubusercontent.com/carrier-io/carrier-io/master/images/installation_step_2.png)

5. Review comfiguration and proceed with installation

   ![alt text](https://raw.githubusercontent.com/carrier-io/carrier-io/master/images/installation_progress.png)

6. Once installation is done you will see `Installation complete ...` message

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

### Installing Carrier instance from CLI.
If you are using AWS Amazon Linux 2 to try carrier.io out, just run following under root:
https://github.com/dzavalei/carrier-io/blob/master/amazon2/install.sh

For Ubuntu and Centos there are corresponding subfolders in https://github.com/dzavalei/carrier-io/ folder.

