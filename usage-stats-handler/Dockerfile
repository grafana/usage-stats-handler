FROM node:24-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV=production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
