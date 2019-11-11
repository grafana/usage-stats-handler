var program = require('commander');
var graphite = require('graphite');
var pkg = require('./package.json');
var _ = require('lodash');
var elastic = require('./elastic');

var restify = require('restify');
var server = restify.createServer({name: 'grafana-statsusage'});

program
  .version(pkg.version)
  .option('-g, --graphite <graphite>', 'Graphite address')
  .option('-e, --elastic <elastic>', 'Elastic address')
  .option('--interval <seconds>', 'Interval in seconds');

program.parse(process.argv);

if (!program.graphite || !program.interval) {
  program.outputHelp();
  process.exit(1);
}

elastic.initElastic({ url: program.elastic });

var graphiteUrl = 'plaintext://' + program.graphite;
var intervalMs = parseInt(program.interval) * 1000;
var prefix = "grafana.usagestats.";

console.log('Graphite: ' + graphiteUrl);
console.log('Interval: ' + intervalMs);

server
  .use(restify.fullResponse())
  .use(restify.bodyParser());

var metrics = {};

function incrementCounter(name, amount) {
  value = metrics[name] || 0;
  value += amount;
  metrics[name] = value;
}

function sendMetrics() {
  _.each(metrics, function(value, key) {
    //console.log('key: ' + key + ' = ' + value);
  });

  var client = graphite.createClient(graphiteUrl);
  client.write(metrics, function(err) {
    if (err) {
      console.log('graphite error', err);
    }
    client.end();
  });

  metrics = {};
}

setInterval(sendMetrics, intervalMs);

server.post('/grafana-usage-report', function (req, res, next) {
  var report = req.body;

  elastic.saveReport(report);
  //console.log('report received: ', report);

  var versionedPrefix = prefix + 'versions.' + report.version + '.';
  var allPrefix = prefix + 'all.';

  incrementCounter(versionedPrefix + 'reports.count', 1);
  incrementCounter(allPrefix + 'reports.count', 1);

  _.each(report.metrics, function(value, key) {
    incrementCounter(versionedPrefix + key, value);
    incrementCounter(allPrefix + key, value);
  });

  res.send({message: 'ok'});
});

server.use(function(err, req, res, next) {
  if (err) {
    console.error("error!", err.toString());
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

server.listen(3540, function () {
  console.log('%s listening at %s', server.name, server.url);
});
