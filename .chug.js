var dir = __dirname;
var version = require(dir + '/package.json').version;

require('figlet').text('D6 Client v' + version, {font: 'Standard'}, function (err, figlet) {

  figlet = figlet.replace(/\n/g, '\n *');

  var source = require('chug')([
    dir + '/node_modules/jymin/scripts',
    dir + '/scripts/d6-jymin.js'
  ]);

  source.concat('d6.js')
    .each(function (asset) {
      var locations = source.getLocations();
      locations.forEach(function (location, index) {
        locations[index] = location.replace(
          /^.*\/(node_modules|workspace)\/(\w+)\/(.*?)$/i,
          ' *   https://github.com/lighterio/$2/blob/master/$3');
      });
      asset.setContent((
        "/**\n" +
        " *" + figlet + "\n" +
        " *\n" +
        " * http://lighter.io/d6\n" +
        " * MIT License\n" +
        " *\n" +
        " * Source files:\n" +
        locations.join("\n") + "\n" +
        " */\n\n\n" +
        asset.getContent() + "\n").replace(/[\t ]*\n/g, '\n'));
    })
    .wrap()
    .write(dir, 'd6-client.js')
    .minify()
    .write(dir, 'd6-client.min.js', 'minified');

});
