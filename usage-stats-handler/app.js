const program = require('commander');
const graphite = require('graphite');
const pkg = require('./package.json');
const _ = require('lodash');
// const elastic = require('./elastic');

const restify = require('restify');
const server = restify.createServer({name: 'grafana-usage-stats'});

function parseIntOption(value) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new program.InvalidOptionArgumentError('Not a number.');
  }
  return parsedValue;
}

program
  .version(pkg.version)
  .requiredOption('-g, --graphite <graphite>', 'Graphite address')
  .option('-e, --elastic <elastic>', 'Elastic address')
  .option('--interval <seconds>', 'Interval in seconds', parseIntOption, 600)
  .parse();

const options = program.opts();

const graphiteUrl = 'plaintext://' + options.graphite;
// const elasticUrl = options.elastic;
const intervalMs = parseInt(options.interval) * 1000;
const prefix = "grafana.usagestats.";

console.log('Graphite: ' + graphiteUrl);
// console.log('Elastic: ' + elasticUrl);
console.log('Interval: ' + intervalMs);

// elastic.initElastic({ url: elasticUrl });

server
  .use(restify.plugins.fullResponse())
  .use(restify.plugins.queryParser())
  .use(restify.plugins.bodyParser());

let metrics = {};

function incrementCounter(name, amount) {
  if (typeof amount != 'number') {
    return false;
  }
  value = metrics[name] || 0;
  value += amount;
  metrics[name] = value;
  return true;
}

function sendMetrics() {
  /*
  _.each(metrics, function(value, key) {
    console.log('key: ' + key + ' = ' + value);
  });
  */

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
  const report = req.body;
  console.log(JSON.stringify(report));

  // elastic.saveReport(report);

  // group versions like 
  // 8_2_0-33922pre as 8_2_0
  // 8_2_0-12341343 as 8_2_0
  // 8_2_0-beta1 as 8_2_0
  // 8_2_0- as 8_2_0
  // This reduces the cardinality of the versions we store
  
  const cleanVersion = report.version.replace(/-.*/, '');
  const versionedPrefix = prefix + 'versions.' + cleanVersion + '.';
  const allPrefix = prefix + 'all.';

  incrementCounter(versionedPrefix + 'reports.count', 1);
  incrementCounter(allPrefix + 'reports.count', 1);

  _.each(report.metrics, function(value, key) {
    incrementCounter(allPrefix + key, value);
  });

  res.send({message: 'ok'});
  return next();
});

server.get('/healthz', function (req, res, next) {
  res.send({message: 'ok'});
  return next();
});

server.use(function(err, req, res, next) {
  if (err) {
    console.error("error!", err.toString());
    console.error(err.stack);
    res.send(500, 'Something broke!');
  }
});

server.listen(3540, function () {
  console.log('%s listening at %s', server.name, server.url);
});
