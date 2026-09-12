FROM node:24-alpine@sha256:50c8e8ca1d27439048670df5883f32d57cf81cff6233222c893fd0d9884cbd81
WORKDIR /usr/src/app/
COPY package.json yarn.lock app.js run.sh ./
RUN yarn install --frozen-lockfile
ENV NODE_ENV=production

EXPOSE 3540
ENTRYPOINT [ "sh", "-c", "/usr/src/app/run.sh" ]
