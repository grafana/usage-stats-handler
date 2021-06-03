#!/bin/sh

echo "graphite: ${GRAPHITE}"
echo "elastic:  ${ELASTIC}"

node /usr/src/app/app.js -g ${GRAPHITE} -e ${ELASTIC} --interval 600