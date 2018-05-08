var program = require('commander');
var Graphite = require('graphite-client');
var pkg = require('./package.json');
var _ = require('lodash');

var restify = require('restify');
var server = restify.createServer({name: 'grafana-statsusage'});

program
  .version(pkg.version)
  .option('-g, --graphite <graphite>', 'Graphite address')
  .option('--interval <seconds>', 'Interval in seconds');

program.parse(process.argv);

if (!program.graphite || !program.interval) {
  program.outputHelp();
  process.exit(1);
}

var graphiteParts = program.graphite.split(':');
var graphite = new Graphite(graphiteParts[0], parseInt(graphiteParts[1]), 'UTF-8');
var intervalMs = parseInt(program.interval) * 1000;
var prefix = "external.received.";

console.log('Graphite: ' + program.graphite);
console.log('Interval: ' + intervalMs);

graphite.on('end', function() {
  console.log('Graphite client disconnected');
});

graphite.on('error', function(error) {
  console.log('Graphite connection failure. ' + error);
});

graphite.connect(function() {
  console.log('Connected to Graphite server');
});

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
	graphite.write(metrics, Date.now(), function(err) {
    console.log('graphite error', err);
	});
	metrics = {};
}

setInterval(sendMetrics, intervalMs);

server.post('/', function (req, res, next) {
  var report = req.body;

  console.log('got metrics on `/` handler');

	_.each(report.metrics, function(value, key) {
	  incrementCounter(prefix + key, value);
	});

	res.send({message: 'ok'});
});

server.listen(3541, function () {
  console.log('%s listening at %s', server.name, server.url);
});
