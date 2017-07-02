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

var _util = require('../util');

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

  (0, _util.each)((0, _util.keys)(consoles), function (consoleName) {
    var gameConsole = consoles[consoleName];

    gameConsole.searchGames();
    var emulator = gameConsole.getEmulator();

    if (emulator) {
      (0, _util.each)(gameConsole.games, function (game) {
        var gameShortcut = {
          appname: gameConsole.prefix + ' ' + game.cleanName,
          exe: emulator.getCommandForGame(game),
          icon: gameConsole.icon,
          tags: gameConsole.tags
        };

        gameShortcut.appname = gameShortcut.appname.replace(/^ +/, '').replace(/ +$/, '');

        if (!game.ignore) {
          var shortcut = shortcutsFile.addShortcut(gameShortcut);
          var appid = shortcut.getAppID();

          console.log('Added game "' + game.cleanName + '" (' + gameConsole.name + ') to Steam shortcuts with APP ID ' + appid);

          games.push({
            gameName: game.cleanName,
            consoleName: gameConsole.name,
            appid: appid
          });
        }
      });
    }
  });

  await shortcutsFile.writeShortcuts();
  console.log('Shortcuts file saved');

  return games;
}