const { program } = require('commander');
const graphite = require('graphite');
const pkg = require('./package.json');
const _ = require('lodash');

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
const intervalMs = parseInt(options.interval) * 1000;
const prefix = "grafana.usagestats.";

console.log('Graphite: ' + graphiteUrl);
console.log('Interval: ' + intervalMs);

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
  console.log(JSON.stringify({ graphite: metrics }));

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

  if (!_.isObject(report)) {
    res.send(400, {message: 'invalid report'});
    return next();
  }
  if (!_.isString(report.version)) {
    res.send(400, {message: 'invalid version'});
    return next();
  }
  if (!_.isObject(report.metrics)) {
    res.send(400, {message: 'invalid metrics'});
    return next();
  }
  
  // gets the first part of the version string if it looks like a semver version.
  // Otherwise we set the version to unknown so its at least a valid key in graphite.
  //
  // v2_0_3 -> 2_0_3
  // 2_0_3 -> 2_0_3
  // 2_0_3-123pre -> 2_0_3
  // 2_0_3foobar -> 2_0_3
  // foobar -> unknown
  matches = report.version.match(/^[v]*[\d\_\d\_\d]+/);
  if (matches == null || matches.length == 0) {
    report.version = 'unknown';
  } else {
    report.version = matches[0];
  }

  console.log(JSON.stringify(report));

  const versionedPrefix = prefix + 'versions.' + report.version + '.';
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
