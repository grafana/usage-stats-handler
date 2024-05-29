#/bin/sh
IMAGENAME=grafana/usage-stats-handler
VERSION=v12-2

DOCKER_DEFAULT_PLATFORM="linux/amd64" docker build -t $IMAGENAME:latest -t $IMAGENAME:$VERSION --no-cache=true .

docker push $IMAGENAME:latest
docker push $IMAGENAME:$VERSION
