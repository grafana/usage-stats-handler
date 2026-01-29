#!/bin/sh

echo "graphite: ${GRAPHITE}"

node /usr/src/app/app.js -g ${GRAPHITE} --interval 600