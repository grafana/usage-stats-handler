.DEFAULT_GOAL = build
BIN_DIR := bin
IMAGE_PREFIX ?= us.gcr.io/usage-stats-handler

GO_LDFLAGS ?= $(shell ./scripts/version goflags)
GO_FLAGS   := -ldflags "-w -s $(GO_LDFLAGS)"
GIT_REVISION ?= $(shell git rev-parse --short HEAD)

GOOS ?= $(shell go version | sed 's/^.*\ \([a-z0-9]*\)\/\([a-z0-9]*\)/\1/')
GOARCH ?= $(shell go version | sed 's/^.*\ \([a-z0-9]*\)\/\([a-z0-9]*\)/\2/')

# Add extra binaries to this space-separated list
targets := usage-stats-handler

# function that generates OS-dependent path to output binary
binname = $(BIN_DIR)/$(1)$(patsubst windows,.exe,$(filter windows,$(GOOS)))

# list of all binary targets to build
bins := $(foreach 1,$(targets),$(binname))

# build all the binaries
build: $(bins)
# build and tag Docker images
docker: $(foreach target,$(targets),$(target).tag)
# build, tag, and push all Docker images
push-docker: $(foreach target,$(targets),$(target).pushed)
# build, tag, and scan all Docker images for vulns
scan-docker: $(foreach target,$(targets),$(target).scanned)

$(bins): $(shell find . -type f -name "*.go") go.mod go.sum
	CGO_ENABLED=0 \
		go build \
			$(GO_FLAGS) \
			-o $@ \
			./cmd/$(patsubst $(call binname,%),%,$@)

clean:
	@rm -f $(bins)
	@rm -f *.iid
	@rm -f *.tag
	@rm -f *.pushed
	@rm -f *.scanned

ifeq ("$(CI)","true")
DOCKER_PROGRESS ?= plain
else
DOCKER_PROGRESS ?= auto
endif

# build a Docker image for the given binary, and store its ID in the target file
%.iid: cmd/%/Dockerfile $(shell find . -type f -name "*.go") go.mod go.sum
	docker build \
		--progress=$(DOCKER_PROGRESS) \
		--build-arg=GIT_REVISION=$(GIT_REVISION) \
		--build-arg=GO_LDFLAGS='$(GO_LDFLAGS)' \
		--file=$< \
		--iidfile=$@ \
		.

dockerversion = "$(IMAGE_PREFIX)/$(patsubst %.tag,%,$(1)):$(shell ./scripts/version docker)"

# creates a new tag from the content of the the iidfiles, then store the tag in
# the target file
%.tag: %.iid
	docker tag $(shell cat $<) $(call dockerversion,$@)
	@echo $(call dockerversion,$@) > $@

# push (and possibly build/tag) the given Docker image, and store its tag in the
# target file
%.pushed: %.tag
	@docker push $(shell cat $<)
	@cp $< $@

# scan (and possibly build/tag) the given Docker image, and store its tag in the
# target file
%.scanned: %.tag
	@trivy image --exit-code=1 --ignore-unfixed $(shell cat $<)
	@cp $< $@

ifeq ($(OS),Windows_NT)
test:
	go test -coverprofile=c.out ./...
else
test:
	go test -race -coverprofile=c.out ./...
endif

lint:
	@golangci-lint run --max-same-issues=0 --max-issues-per-linter=0

ci-lint:
	@golangci-lint run --max-same-issues=0 --max-issues-per-linter=0 --out-format=github-actions

.PHONY: clean test build lint ci-lint docker push-docker scan-docker
.DELETE_ON_ERROR:
.SECONDARY:
