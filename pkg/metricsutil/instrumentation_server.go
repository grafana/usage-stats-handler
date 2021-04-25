package metricsutil

import (
	"flag"
	"fmt"
	"net"
	"net/http"

	"github.com/cortexproject/cortex/pkg/util"
	"github.com/go-kit/kit/log/level"
	"github.com/gorilla/mux"
	"github.com/weaveworks/common/server"
)

// InstrumentationServerConfig configures an instrumentation server
type InstrumentationServerConfig struct {
	Port int
}

// RegisterFlags adds the flags required to config this to the given FlagSet
func (cfg *InstrumentationServerConfig) RegisterFlags(f *flag.FlagSet) {
	f.IntVar(&cfg.Port, "instrumentation.server.port", 8001, "port to use for hosting instrumentation endpoints")
}

// InstrumentationServer serves instrumentation endpoints on a different port
// than the default server
type InstrumentationServer struct {
	srv *http.Server
}

// NewInstrumentationServer returns an instrumentation server
func NewInstrumentationServer(cfg InstrumentationServerConfig) (*InstrumentationServer, error) {
	// Setup listeners first, so we can fail early if the port is in use.
	httpListener, err := net.Listen("tcp", fmt.Sprintf(":%d", cfg.Port))
	if err != nil {
		return nil, fmt.Errorf("failed to listen on port %d: %w", cfg.Port, err)
	}

	router := mux.NewRouter()
	server.RegisterInstrumentation(router)

	router.Handle("/healthz", &healthHandler{})
	router.Handle("/readyz", &readyHandler{})

	srv := &http.Server{
		Handler: router,
	}

	go func() {
		if err := srv.Serve(httpListener); err != nil {
			level.Error(util.Logger).Log("msg", "metrics server terminated", "err", err)
		}
	}()

	return &InstrumentationServer{srv}, nil
}

// Stop closes the instrumentation server
func (m *InstrumentationServer) Stop() {
	m.srv.Close()
}

// healthHandler - handles calls to /healthz'
type healthHandler struct{}

var _ http.Handler = (*healthHandler)(nil)

func (h *healthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

// readyHandler - handles calls to /readyz'
type readyHandler struct{}

var _ http.Handler = (*readyHandler)(nil)

func (h *readyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}
