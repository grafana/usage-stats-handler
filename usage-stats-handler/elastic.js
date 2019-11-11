var _ = require('lodash');
var restify = require('restify');
var moment = require('moment');
var client;

console.log('Starting Elasticsearch logger');

function initElastic(opts) {
  console.log("configured elastic ", opts);
  client = restify.createJsonClient({ url: opts.url });

  client.put('/_template/usage-stats', {
    "template" : "usage-stats-*",
    "mappings" : {
      "report" : {
        "_source" : {"enabled" : true },

        "properties": {
          "@timestamp": {type: 'date', "format": "epoch_millis" },
        },

        "dynamic_templates": [
          {
            "strings": {
              "match_mapping_type": "string",
              "mapping": {
                "type": "keyword",
                "index" : "not_analyzed",
                "omit_norms" : true,
              }
            }
          }
        ]
      }
    }
  }, function(err) {
    console.log('template mapping res:', err);
  });
}

function saveReport(report) {

  var metrics = {};

  _.each(report.metrics, function(value, key) {
    metrics[key.replace(/\./g, "_")] = value;
	});

  metrics["@timestamp"] = new Date().getTime();
  metrics.version = report.version;
  metrics.os = report.os;
  metrics.arch = report.arch;

  client.post('/usage-stats-' + moment().format('YYYY.MM.DD') + '/report', metrics, function(err) {
    if (err) {
      console.log('Metric write error', err);
    }
  });
}

module.exports = {
  saveReport: saveReport,
  initElastic: initElastic
};
