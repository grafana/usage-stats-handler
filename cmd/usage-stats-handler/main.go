package main

import (
	"flag"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/Jeffail/gabs"
	"github.com/cortexproject/cortex/pkg/util"
	"github.com/cortexproject/cortex/pkg/util/flagext"
	"github.com/go-kit/kit/log/level"
	"github.com/grafana/usage-stats-handler/pkg/metricsutil"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/common/version"
	"github.com/weaveworks/common/server"
)

func main() {
	var (
		serverConfig          server.Config
		instrumentationConfig metricsutil.InstrumentationServerConfig
		downstreamUrlFlag     string
		applicationName       = "usage_stats_handler"
	)

	flagext.RegisterFlags(&serverConfig, &instrumentationConfig)
	flag.StringVar(&downstreamUrlFlag, "usage-stats.downstream", "http://localhost:3000", "URL of the original usage stats handler")
	flag.Parse()

	util.InitLogger(&serverConfig)

	downstreamUrl, err := url.Parse(downstreamUrlFlag)
	if err != nil {
		level.Error(util.Logger).Log("msg", "failed to create server", "err", err)
		return
	}

	server, err := server.New(serverConfig)
	if err != nil {
		level.Error(util.Logger).Log("msg", "failed to create server", "err", err)
		return
	}
	defer server.Shutdown()

	server.HTTP.PathPrefix("/").Name("proxydownstream").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logPayload(r)
		httputil.NewSingleHostReverseProxy(downstreamUrl).ServeHTTP(w, r)
	})

	prometheus.MustRegister(version.NewCollector(applicationName))

	instrumentationServer, err := metricsutil.NewInstrumentationServer(instrumentationConfig)
	if err != nil {
		level.Error(util.Logger).Log("msg", "error initializing the instrumentation server", "err", err)
		return
	}
	defer instrumentationServer.Stop()

	server.Run()
}

func logPayload(req *http.Request) {
	copy := req.Clone(req.Context())

	body, err := ioutil.ReadAll(copy.Body)
	if err != nil {
		level.Error(util.Logger).Log("failed to read body", "error", err)
	}

	jsonParsed, err := gabs.ParseJSON(body)
	if err != nil {
		level.Error(util.Logger).Log("failed to parse json", "error", err)
	}

	level.Info(util.Logger).Log("usage payload", jsonParsed)
}
