FROM ubuntu

WORKDIR /opt

# This suppresses a bunch of annoying warnings from debconf
ENV DEBIAN_FRONTEND noninteractive

# Install system dependencies
RUN \
  apt-get -qq update -y && \
  apt-get -qq install -y wget git

RUN \
  wget -qO - https://deb.nodesource.com/setup_4.x | bash - && \
  apt-get -qq install -y nodejs && \
  apt-get -qq clean -y && rm -rf /var/lib/apt/lists/* && \
  
# StatsD Version
ENV VERSION v0.8.0

# Install StatsD
RUN \
  mkdir -p /opt && \
  cd /opt && \
  wget -qO statsd.tar.gz https://github.com/etsy/statsd/archive/v$VERSION.tar.gz && \
  tar -xzf statsd.tar.gz && \
  mv statsd-$VERSION statsd && \
  rm -f statsd.tar.gz && \
  wget -qO statsd/backends/wavefront.js https://raw.githubusercontent.com/wavefrontHQ/StatsD/master/backends/wavefront.js

EXPOSE \
  # StatsD UDP
  8125/udp \
  # StatsD Admin
  8126

VOLUME ["/etc/statsd"]

# Launch StatsD
CMD ["/usr/bin/node", "/opt/statsd/stats.js", "/etc/statsd/config.js"]
