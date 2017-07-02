'use strict';

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _consoleLoader = require('./service/console-loader');

var _consoleLoader2 = _interopRequireDefault(_consoleLoader);

var _gridProvider = require('./service/grid-provider');

var _gridProvider2 = _interopRequireDefault(_gridProvider);

var _userConfig = require('./user-config');

var _shortcutsLoader = require('./service/shortcuts-loader');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isWin = /^win/.test(process.platform);

if (!isWin) {
  throw new Error('This script is only supported on Windows');
}

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
  if (global.openUserConfigDir) {
    console.log('Opening user config folder in 3 seconds');
    await (0, _util.timeout)(500);
    console.log('3...');
    await (0, _util.timeout)(1000);
    console.log('2...');
    await (0, _util.timeout)(1000);
    console.log('1...');
    await (0, _util.timeout)(1000);
    console.log('Opening user config folder ' + global.USER_CONFIG_DIR);
    await (0, _util.timeout)(500);
    _child_process2.default.exec('start "" "' + global.USER_CONFIG_DIR + '"');
  }
}

main();