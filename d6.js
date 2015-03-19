var zlib = require('zlib');

/**
 * Accept a chug library object, and add a filter.
 */
var d6 = module.exports = function (app) {

  app.chug.onceReady(function () {

    var views = app.views;

    // Iterate over the views building an array of key-value pair strings.
    var pairs = [];
    views.each(function (asset) {
      var compiled = asset.getCompiledContent();
      var minified = asset.getMinifiedContent();
      var key = compiled.key.replace(/"/g, '\\"');
      pairs.push(JSON.stringify(key) + ':' + minified.toString());
    });

    // If using Ltl, include escaping functions.
    var ltl = process.ltl;
    if (ltl) {
      pairs.push('$:' + ltl.$.toString());
      pairs.push('"&":' + ltl['&'].toString());
    }

    // Route the views with pre-zipping so clients can download them quickly.
    views.then(function () {
      var env = process.env.NODE_ENV || 'prod';
      var isDevOrDebug = (env[0] == 'd');
      var br = isDevOrDebug ? '\n' : '';
      var tab = isDevOrDebug ? '  ' : '';
      // TODO: Allow views to be separated into batches to reduce payload.
      var url = '/d6.js';
      var code = 'D6({' + br + tab + pairs.join(',' + br + tab) + br + '});';
      zlib.gzip(code, function (err, zipped) {
        app.server.get(url, function (request, response) {
          response.sd6usCode = 200;
          response.setHeader('content-type', 'text/javascript');
          if (response.zip) {
            response.zip(code, zipped);
          }
          else {
            response.end(code);
          }
        });
        var colorUrl = url.cyan || url;
        var logInfo = (app.log || console).info;
        logInfo('[D6] Views routed to ' + colorUrl + '.');
      });
    });

  });
};

/**
 * Expose the D6 version via package.json lazy loading.
 */
Object.defineProperty(d6, 'version', {
  get: function () {
    return require(__dirname + '/package.json').version;
  }
});

/**
 * Expose the paths to D6's front-end scripts.
 */
d6.jymin = __dirname + '/scripts/d6-jymin.js';
d6.client = __dirname + '/d6-client.js';
d6.clientMin = __dirname + '/d6-client.min.js';
