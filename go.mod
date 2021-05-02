module github.com/grafana/usage-stats-handler

go 1.15

require (
	github.com/Jeffail/gabs v1.4.0
	github.com/cortexproject/cortex v1.7.0
	github.com/go-kit/kit v0.10.0
	github.com/google/go-cmp v0.5.4 // indirect
	github.com/gorilla/mux v1.8.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.2.2 // indirect
	github.com/prometheus/client_golang v1.9.0
	github.com/prometheus/common v0.18.0
	github.com/sirupsen/logrus v1.8.1 // indirect
	github.com/stretchr/testify v1.7.0 // indirect
	github.com/weaveworks/common v0.0.0-20210208163615-da2819181d05
	golang.org/x/mod v0.4.1 // indirect
	golang.org/x/net v0.0.0-20210226172049-e18ecbb05110 // indirect
	golang.org/x/sys v0.0.0-20210228012217-479acdf4ea46 // indirect
	golang.org/x/text v0.3.5 // indirect
	golang.org/x/tools v0.1.0 // indirect
	google.golang.org/grpc v1.35.0 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
)

// ¯\_(ツ)_/¯ https://github.com/cortexproject/cortex/blob/master/go.mod#L84
replace google.golang.org/grpc => google.golang.org/grpc v1.29.1

// transient unused dependency, but without this 'go mod download' breaks
replace k8s.io/client-go => k8s.io/client-go v0.20.2
