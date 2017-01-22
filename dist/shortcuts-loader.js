'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSteamConfigPath = getSteamConfigPath;
exports.loadShortcutsFile = loadShortcutsFile;
exports.generateShortcuts = generateShortcuts;

var _shortcutFile = require('./shortcut-file');

var _shortcutFile2 = _interopRequireDefault(_shortcutFile);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSteamConfigPath() {
    var users = _fs2.default.readdirSync("C:/Program Files (x86)/Steam/userdata/");

    if (!users || !users.length) console.error('No steam directory found !');

    var filePath = "C:/Program Files (x86)/Steam/userdata/" + users[0] + "/config";

    return filePath;
}

function loadShortcutsFile() {
    return new Promise(function (resolve, reject) {
        var filePath = _path2.default.join(getSteamConfigPath(), 'shortcuts.vdf');

        var shortcutFile = new _shortcutFile2.default(filePath);

        return resolve(shortcutFile);
    });
}

function generateShortcuts(_ref, callback) {
    var consoles = _ref.consoles,
        shortcutsFile = _ref.shortcutsFile;

    var games = [];

    _lodash2.default.each(consoles, function (gameConsole, name) {
        gameConsole.searchGames();
        var emulator = gameConsole.getEmulator();

        if (!emulator) return;

        _lodash2.default.each(gameConsole.games, function (game) {
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
        });
    });

    shortcutsFile.writeShortcuts(function (error) {
        return callback(error, error ? [] : games);
    });
}
//# sourceMappingURL=shortcuts-loader.js.map