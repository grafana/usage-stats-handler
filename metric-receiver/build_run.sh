#!/bin/bash

docker build --no-cache --tag grafana/metric-receiver .

docker run -it -p 3541:3541 -e "GRAPHITE=localhost:2003" grafana/metric-receiver
