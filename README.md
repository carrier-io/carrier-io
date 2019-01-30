# Carrier | Continuous test execution platform
## Platform Configuration. Standalone Deployment. 
### Ubuntu 16.04
as a root user 

```curl https://raw.githubusercontent.com/carrier-io/carrier-io/master/ubuntu/install.sh | bash```

during installation you will be asked to input prefered amount of workers and public DNS name

one installation is done you can find:

jenkins on `<public_dns>/jenkins`

grafana on `<public_dns>/grafana`

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
       
