FROM node:14.17.0-alpine
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js elastic.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
