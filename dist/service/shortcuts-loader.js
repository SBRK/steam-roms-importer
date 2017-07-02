'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadShortcutsFile = exports.getSteamConfigPath = undefined;
exports.generateShortcuts = generateShortcuts;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _model = require('../model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getSteamConfigPath = exports.getSteamConfigPath = function getSteamConfigPath() {
  var users = _fs2.default.readdirSync('C:/Program Files (x86)/Steam/userdata/');

  if (!users || !users.length) throw new Error('No steam directory found !');

  var filePath = 'C:/Program Files (x86)/Steam/userdata/' + users[0] + '/config';

  return filePath;
};

var loadShortcutsFile = exports.loadShortcutsFile = function loadShortcutsFile() {
  return new Promise(function (resolve) {
    var filePath = _path2.default.join(getSteamConfigPath(), 'shortcuts.vdf');

    var shortcutFile = new _model.ShortcutFile(filePath);

    return resolve(shortcutFile);
  });
};

async function generateShortcuts(consoles, shortcutsFile) {
  var games = [];

  for (var consoleName in consoles) {
    var gameConsole = consoles[consoleName];

    gameConsole.searchGames();
    var emulator = gameConsole.getEmulator();

    if (emulator) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = gameConsole.games[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var game = _step.value;

          var gameShortcut = {
            appname: gameConsole.prefix + ' ' + game.cleanName,
            exe: emulator.getCommandForGame(game),
            icon: gameConsole.icon,
            tags: gameConsole.tags
          };

          gameShortcut.appname = gameShortcut.appname.replace(/^ +/, '').replace(/ +$/, '');

          if (!game.ignore) {
            var shortcut = shortcutsFile.addShortcut(gameShortcut);

            games.push({
              gameName: game.cleanName,
              consoleName: gameConsole.name,
              appid: shortcut.getAppID()
            });
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }

  await shortcutsFile.writeShortcuts();

  return games;
}
//# sourceMappingURL=shortcuts-loader.js.map