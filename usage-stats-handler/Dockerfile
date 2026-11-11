FROM node:24-alpine@sha256:61cf3202592df80f42ff3a595636e97039b351d1bd2a1c475f897f328e4870ed
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV=production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
