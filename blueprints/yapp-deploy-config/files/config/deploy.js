var pluginPack = require('ember-cli-deploy-yapp-pack');

module.exports = function(deployTarget) {
  return pluginPack.getConfiguration('[prefix]', '[humanAppName]', deployTarget);
};

