const { program } = require('commander');
const graphite = require('graphite');
const pkg = require('./package.json');
const _ = require('lodash');
const express = require('express');

const app = express();
const serverName = 'grafana-usage-stats';

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
  .option('-g, --graphite <graphite>', 'Graphite address', 'graphite:2003')
  .option('--interval <seconds>', 'Interval in seconds', parseIntOption, 600)
  .parse();

const options = program.opts();

const graphiteUrl = 'plaintext://' + options.graphite;
const intervalMs = parseInt(options.interval) * 1000;
const prefix = "grafana.usagestats.";

console.log('Graphite: ' + graphiteUrl);
console.log('Interval: ' + intervalMs);

// Express middleware
app.use(express.json());

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

app.post('/grafana-usage-report', function (req, res) {
  const report = req.body;

  if (!_.isObject(report)) {
    return res.status(400).json({message: 'invalid report'});
  }
  if (!_.isString(report.version)) {
    return res.status(400).json({message: 'invalid version'});
  }
  if (!_.isObject(report.metrics)) {
    return res.status(400).json({message: 'invalid metrics'});
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

  res.json({message: 'ok'});
});

app.get('/healthz', function (req, res) {
  res.json({message: 'ok'});
});

// Error handling middleware
app.use(function(err, req, res, next) {
  if (err) {
    console.error("error!", err.toString());
    console.error(err.stack);
    res.status(500).send('Something broke!');
  } else {
    next();
  }
});

const PORT = 3540;
app.listen(PORT, function () {
  console.log('%s listening at http://localhost:%d', serverName, PORT);
});
