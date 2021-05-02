package main

import (
	"flag"
	"net/http"
	"net/http/httputil"
	"net/url"

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
