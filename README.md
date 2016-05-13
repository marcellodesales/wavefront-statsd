

# Wavefront StatsD Backend

The Wavefront StatsD backend emits StatsD metrics to Wavefront. It also extends StatsD by allowing point tags.

[![logo](http://dockeri.co/image/marcellodesales/wavefront-statsd)](https://hub.docker.com/u/marcellodesales/wavefront-statsd)

## Installation
This readme assumes you've already downloaded [statsd](https://github.com/etsy/statsd) and have a basic understanding. 

1. Clone or download StatsD from https://github.com/etsy/statsd.
2. Simply drop `backends/wavefront.js` from this repository into the statsd `backends` directory.
3. Update `config.js` to use the backend.

## Configuring

The backend expects the following parameters:
- wavefrontHost - The host on your network that is running the Wavefront proxy.
- wavefrontPort - The port that your Wavefront proxy is listening on.
- wavefrontTagPrefix - The prefix for point tags (see Tagging Metrics below).
- defaultSource - The source tag that will get added to metrics as they're sent to Wavefront if one is not provided. This is a required parameter.

Below is an example of a complete config.js for using the Wavefront backend.
```
{ 
  port: 8125
, backends: ["./backends/wavefront"]
, wavefrontHost: '192.168.99.100'
, wavefrontPort: 2878
, wavefrontTagPrefix: '~'
, keyNameSanitize: false
, defaultSource: 'statsd'
}
```

## Docker Container

You can use our Docker image along with cAdvisor to send stats to a Proxy server.

* WATERFRONT_PROXY_HOST: Your proxy waterfront host
* WATERFRONT_PROXY_PORT: your proxy waterfront port (defaults to 2878)

```yml
version: "2"

services:
  statsd:
    image: marcellodesales/wavefront-statsd
    restart: always
    ports:
      - "8125/udp"
    environments:
      - WATERFRONT_HOST=waterfrontproxy-test.mycompany.net

  cadvisor:
    image: google/cadvisor:v0.23.0
    command: -storage_driver=statsd -storage_driver_db=${HOSTNAME} -storage_driver_host=statsd:8125} \
             -storage_driver_buffer_duration=1m --nosystemd --vmodule=*=4
    restart: always
    ports:
      - "6090:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
```

You can use Docker-compose 1.7.x+ with this and bootstrap everything together:

```
# docker-compose -f services/monitoring.yml up -d
Creating services_statsd_1
Creating services_cadvisor_1
```

Look at the logs and make sure it is properly loading your server:

```
cadvisor_1  | I0513 19:19:07.671648       1 manager.go:188] Version: {KernelVersion:3.10.0-327.13.1.el7.x86_64 ContainerOsVersion:Alpine Linux v3.2 DockerVersion:1.10.3 CadvisorVersion:0.23.0 CadvisorRevision:750f18e}
cadvisor_1  | I0513 19:19:07.888269       1 factory.go:208] Registering Docker factory
cadvisor_1  | E0513 19:19:07.888325       1 manager.go:229] Registration of the rkt container factory failed: unable to communicate with Rkt api service: rkt: cannot tcp Dial rkt api service: dial tcp 127.0.0.1:15441: getsockopt: connection refused
cadvisor_1  | I0513 19:19:07.888778       1 factory.go:53] Registering systemd factory
cadvisor_1  | I0513 19:19:07.896386       1 factory.go:85] Registering Raw factory
cadvisor_1  | I0513 19:19:08.197858       1 manager.go:1024] Started watching for new ooms in manager
cadvisor_1  | W0513 19:19:08.198068       1 manager.go:264] Could not configure a source for OOM detection, disabling OOM events: exec: "journalctl": executable file not found in $PATH
cadvisor_1  | I0513 19:19:08.198955       1 manager.go:277] Starting recovery of all containers
cadvisor_1  | I0513 19:19:08.389092       1 manager.go:282] Recovery completed
cadvisor_1  | I0513 19:19:08.466788       1 cadvisor.go:148] Starting cAdvisor version: 0.23.0-750f18e on port 8080
statsd_1    | 13 May 19:19:04 - [1] reading config file: config.js
statsd_1    | 13 May 19:19:04 - server is up
statsd_1    | ===~~~~~.... WAVEFRONT SETTINGS .....~~~~~=====
statsd_1    | { port: 8125,
statsd_1    |   backends: [ './backends/wavefront' ],
statsd_1    |   wavefrontHost: 'wavefrontproxy-test.mycompany.net',
statsd_1    |   wavefrontPort: 2878,
statsd_1    |   wavefrontTagPrefix: '~',
statsd_1    |   keyNameSanitize: false,
statsd_1    |   flushInterval: 10000 }
statsd_1    | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

```

## Tagging Metrics

By default, you can send metrics through StatsD as follows:

```
echo "gauge1:+3|g" | nc -u -w0 192.168.99.100 8125
```

The Wavefront backend supports tagging by allowing you to pass tags as part of the metric name. In order to support this, the `keyNameSanitize` config option must be set to `false` in your config. For example:

```
echo "gauge1~tag1=v1~tag2=v2:+3|g" | nc -u -w0 192.168.99.100 8125
```
This will produce a metric that looks like:
```
gauge1:+3
 - tag1:v1
 - tag2:v2
```

Metrics are sent to Wavefront in the Wavefront format. See the "Wavefront Data Format" in our knowledgebase for more information.

### Requirements

The Wavefront backend will work with any recent copy of StatsD. It will not work with version 0.7.2 or before as the `keynameSanitize` option was not added until ~ Feb 2015.

### Running in Docker (Optional)
A Dockerfile is provided that will install the latest version of both StatsD and the Wavefront backend in an ubuntu container. In order to provide your own config out of the box, you have to mount a volume as shown in step #2:

1. Build it: `docker build -t wavefronthq/statsd https://github.com/wavefrontHQ/StatsD.git#master:docker`
2. Run it: `docker run -d -p 8125:8125/udp --name statsd -v /pathtoyourconfig/config.js:/opt/statsd/config.js wavefronthq/statsd`



