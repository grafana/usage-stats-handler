FROM node:24-alpine@sha256:2867d550cf9d8bb50059a0fff528741f11a84d985c732e60e19e8e75c7239c43
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js elastic.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
