FROM node:24-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV=production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
