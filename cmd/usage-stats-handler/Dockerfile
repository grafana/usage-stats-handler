FROM golang:1.15.8-alpine3.13 AS build

RUN apk add --no-cache ca-certificates make git

WORKDIR /go/src/github.com/grafana/usage-stats-handler

ARG TARGETOS
ARG TARGETARCH
ARG TARGETVARIANT
ENV GOOS=$TARGETOS GOARCH=$TARGETARCH

ARG GIT_REVISION
ARG GO_LDFLAGS

COPY go.mod go.sum ./
RUN  make bin/usage-stats-handler

FROM alpine:3.13.2 AS runtime

COPY --from=build /go/src/github.com/grafana/usage-stats-handler/bin/usage-stats-handler /bin/usage-stats-handler

ARG GIT_REVISION

LABEL org.opencontainers.image.revision=$GIT_REVISION \
	org.opencontainers.image.vendor="Grafana Labs" \
	org.opencontainers.image.title="usage-stats-handler" \
	org.opencontainers.image.source="https://github.com/grafana/usage-stats-handler"

ENTRYPOINT [ "/bin/usage-stats-handler" ]
CMD [ "--help" ]
