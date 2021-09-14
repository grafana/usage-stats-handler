const _ = require('lodash');
const restify = require('restify-clients');
const moment = require('moment');
let client;

function initElastic(opts) {
  console.log('Starting Elasticsearch logger');
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
  const metrics = {};

  _.each(report.metrics, function(value, key) {
    metrics[key.replace(/\./g, "_")] = value;
  });

  metrics["@timestamp"] = new Date().getTime();
  metrics.version = report.version;
  metrics.os = report.os;
  metrics.arch = report.arch;
  metrics.usage_stats_id = report.usageStatsId;

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
