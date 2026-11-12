FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV=production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
