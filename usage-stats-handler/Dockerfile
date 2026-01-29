FROM node:24-alpine@sha256:cd6fb7efa6490f039f3471a189214d5f548c11df1ff9e5b181aa49e22c14383e
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js elastic.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
