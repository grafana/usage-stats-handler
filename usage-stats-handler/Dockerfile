FROM node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV=production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
