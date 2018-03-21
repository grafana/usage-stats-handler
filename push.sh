#/bin/sh
VERSION=v1

docker build -t grafana/usage-stats-handler:latest -t grafana/usage-stats-handler:$VERSION --no-cache=true .

docker push grafana/usage-stats-handler:latest
docker push grafana/usage-stats-handler:$VERSION