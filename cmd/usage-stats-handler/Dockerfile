# syntax=docker/dockerfile:1.2.1-labs
FROM golang:1.15.8-alpine3.13 AS build

RUN apk add --no-cache ca-certificates make git

WORKDIR /go/src/github.com/grafana/usage-stats-handler

ARG TARGETOS
ARG TARGETARCH
ARG TARGETVARIANT
ENV GOOS=$TARGETOS GOARCH=$TARGETARCH

ARG GIT_REVISION
ARG GO_LDFLAGS

# cache packages for significantly faster builds
COPY go.mod go.sum ./
RUN --mount=type=cache,id=go-build-${TARGETOS}-${TARGETARCH}${TARGETVARIANT},target=/root/.cache/go-build \
	--mount=type=cache,id=go-pkg-${TARGETOS}-${TARGETARCH}${TARGETVARIANT},target=/go/pkg \
		go mod download -x

COPY . .
RUN --mount=type=cache,id=go-build-${TARGETOS}-${TARGETARCH}${TARGETVARIANT},target=/root/.cache/go-build \
	--mount=type=cache,id=go-pkg-${TARGETOS}-${TARGETARCH}${TARGETVARIANT},target=/go/pkg \
	make bin/hgapi

FROM alpine:3.13.2 AS runtime

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /go/src/github.com/grafana/usage-stats-handler/bin/hgapi /bin/hgapi

ARG GIT_REVISION

LABEL org.opencontainers.image.revision=$GIT_REVISION \
	org.opencontainers.image.vendor="Grafana Labs" \
	org.opencontainers.image.title="usage-stats" \
	org.opencontainers.image.source="https://github.com/grafana/usage-stats-handler"

ENTRYPOINT [ "/bin/usage-stats-handler" ]
CMD [ "--help" ]
