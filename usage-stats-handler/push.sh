#/bin/sh
IMAGENAME=grafana/usage-stats-handler
VERSION=v8

docker build -t $IMAGENAME:latest -t $IMAGENAME:$VERSION --no-cache=true .

docker push $IMAGENAME:latest
docker push $IMAGENAME:$VERSION
