#!/bin/bash

docker build --no-cache --tag grafana/usage-stats-handler .

docker run -it -p 3540:3540 -e "GRAPHITE=localhost:2003" -e "ELASTIC=http://localhost:9200" grafana/usage-stats-handler
