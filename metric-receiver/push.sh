#/bin/sh
VERSION=v1

docker build -t bergquist/metric-receiver:latest -t bergquist/metric-receiver:$VERSION --no-cache=true .

docker push bergquist/metric-receiver:latest
docker push bergquist/metric-receiver:$VERSION