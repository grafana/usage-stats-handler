#/bin/sh
VERSION=v2

# docker build -t grafana/usage-stats-handler:latest -t grafana/usage-stats-handler:$VERSION --no-cache=true .

# docker push grafana/usage-stats-handler:latest
# docker push grafana/usage-stats-handler:$VERSION

docker build -t bergquist/usage-stats-handler:latest -t bergquist/usage-stats-handler:$VERSION --no-cache=true .

docker push bergquist/usage-stats-handler:latest
docker push bergquist/usage-stats-handler:$VERSION