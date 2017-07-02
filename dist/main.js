'use strict';

var _userConfig = require('./user-config');

var _consoleLoader = require('./service/console-loader');

var _consoleLoader2 = _interopRequireDefault(_consoleLoader);

var _shortcutsLoader = require('./service/shortcuts-loader');

var _gridProvider = require('./service/grid-provider');

var _gridProvider2 = _interopRequireDefault(_gridProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on('unhandledRejection', function (reason, p) {
  console.log('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});

async function main() {
  global.USER_CONFIG_DIR = await (0, _userConfig.getUserConfigDirectory)();

  var consoles = await (0, _consoleLoader2.default)();
  var shortcutsFile = await (0, _shortcutsLoader.loadShortcutsFile)();
  var games = await (0, _shortcutsLoader.generateShortcuts)(consoles, shortcutsFile);

  await (0, _gridProvider2.default)(games, (0, _shortcutsLoader.getSteamConfigPath)());
  console.log('All done !');
}

main();