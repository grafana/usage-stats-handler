var _ = require('underscore');
var restify = require('restify');
var client = restify.createJsonClient({ url: 'http://localhost:9200' });

console.log('Starting Elasticsearch logger');

client.put('/_template/usage-stats', {
  "template" : "usage-stats",
  "settings" : { "number_of_shards" : 1, "number_of_replicas": 0 },
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
              "type": "string",
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

function saveReport(report) {

  var metrics = {};

  _.each(report.metrics, function(value, key) {
    metrics[key.replace(/\./g, "_")] = value;
	});

  metrics["@timestamp"] = new Date().getTime();
  metrics.version = report.version;

  client.post('/usage-stats/report', metrics, function(err) {
    if (err) {
      console.log('Metric write error', err);
    }
  });
}

module.exports = {
  saveReport: saveReport
};
