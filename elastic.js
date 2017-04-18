var _ = require('lodash');
var restify = require('restify');
var client = restify.createJsonClient({ url: 'http://localhost:9200' });

console.log('Starting Elasticsearch logger');

client.put('/usage-stats3', {  
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

function saveReport(report) {

  var metrics = {};

  _.each(report.metrics, function(value, key) {
    metrics[key.replace(/\./g, "_")] = value;
	});

  metrics["@timestamp"] = new Date().getTime();
  metrics.version = report.version;

  client.post('/usage-stats3/report', metrics, function(err) {
    if (err) {
      console.log('Metric write error', err);
    }
  });
}

module.exports = {
  saveReport: saveReport
};
