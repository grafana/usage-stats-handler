FROM node:21-alpine@sha256:78c45726ea205bbe2f23889470f03b46ac988d14b6d813d095e2e9909f586f93
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js elastic.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
