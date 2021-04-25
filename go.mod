module github.com/grafana/usage-stats-handler

go 1.15

require (
	github.com/cortexproject/cortex v1.7.0
	github.com/go-kit/kit v0.10.0
	github.com/go-sql-driver/mysql v1.5.0
	github.com/google/go-cmp v0.5.4 // indirect
	github.com/gorilla/mux v1.8.0
	github.com/lestrrat-go/tcputil v0.0.0-20180223003554-d3c7f98154fb // indirect
	github.com/lestrrat-go/test-mysqld v0.0.0-20190527004737-6c91be710371
	github.com/prometheus/client_golang v1.9.0
	github.com/prometheus/common v0.18.0
	github.com/prometheus/prometheus v1.8.2-0.20201119181812-c8f810083d3f
	github.com/sirupsen/logrus v1.7.0 // indirect
	github.com/stretchr/testify v1.7.0
	github.com/weaveworks/common v0.0.0-20210208163615-da2819181d05
	golang.org/x/net v0.0.0-20201202161906-c7110b5ffcbb // indirect
	google.golang.org/grpc v1.35.0 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	vitess.io/vitess v0.8.0
)

// ¯\_(ツ)_/¯ https://github.com/cortexproject/cortex/blob/master/go.mod#L84
replace google.golang.org/grpc => google.golang.org/grpc v1.29.1

// transient unused dependency, but without this 'go mod download' breaks
replace k8s.io/client-go => k8s.io/client-go v0.20.2
