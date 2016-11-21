'use strict';

var _shortcutFile = require('./shortcut-file');

var _shortcutFile2 = _interopRequireDefault(_shortcutFile);

var _gridProvider = require('./grid-provider');

var _userConfig = require('./user-config');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _gameConsole = require('./game-console');

var _gameConsole2 = _interopRequireDefault(_gameConsole);

var _emulator = require('./emulator');

var _emulator2 = _interopRequireDefault(_emulator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadConsoles = function loadConsoles() {
    return (0, _userConfig.loadConfigObject)('consoles', _gameConsole2.default);
};

var loadEmulators = function loadEmulators(consoles) {
    return new Promise(function (resolve, reject) {
        (0, _userConfig.loadConfigObject)('emulators', _emulator2.default).then(function (emulators) {
            return resolve({ consoles: consoles, emulators: emulators });
        });
    });
};

var getSteamConfigPath = function getSteamConfigPath() {
    var users = _fs2.default.readdirSync("C:/Program Files (x86)/Steam/userdata/");

    if (!users || !users.length) console.error('No steam directory found !');

    var filePath = "C:/Program Files (x86)/Steam/userdata/" + users[0] + "/config";

    return filePath;
};

var loadShortcutsFile = function loadShortcutsFile() {
    return new Promise(function (resolve, reject) {
        var filePath = _path2.default.join(getSteamConfigPath(), 'shortcuts.vdf');

        var shortcutFile = new _shortcutFile2.default(filePath);

        return resolve(shortcutFile);
    });
};

var generateShortcuts = function generateShortcuts(consoles, shortcutsFile) {
    var grids = [];

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

                grids.push({
                    gameName: game.cleanName,
                    consoleName: gameConsole.name,
                    appid: shortcut.getAppID()
                });
            }
        });
    });

    shortcutsFile.writeShortcuts();

    _async2.default.mapSeries(grids, function (_ref, callback) {
        var gameName = _ref.gameName,
            consoleName = _ref.consoleName,
            appid = _ref.appid;

        var filePath = _path2.default.join(getSteamConfigPath(), 'grid', appid + '.png');

        if (_fs2.default.existsSync(filePath)) {
            console.log('Grid image for ' + gameName + ' already exists');
            return callback(null);
        }

        (0, _gridProvider.findGridImages)(gameName, consoleName).then(function (images) {
            if (images && images.length) {
                var url = images[0].image;
                var request = url.indexOf('https:') != -1 ? _https2.default : _http2.default;

                try {
                    request.get(url, function (response) {
                        var file = _fs2.default.createWriteStream(filePath);

                        console.log('Found grid for ' + gameName);

                        response.pipe(file);
                        return callback(null);
                    });
                } catch (e) {
                    console.log('No grid image found for ' + gameName);
                    return callback(null);
                }
            } else {
                console.log('No grid image found for ' + gameName);
                return callback(null);
            }
        });
    });
};

(0, _userConfig.getUserConfigDirectory)().then(function (userConfigDir) {
    global.USER_CONFIG_DIR = userConfigDir;

    loadConsoles().then(loadEmulators).then(function (_ref2) {
        var consoles = _ref2.consoles,
            emulators = _ref2.emulators;

        _lodash2.default.each(emulators, function (emulator, emulatorName) {
            _lodash2.default.each(emulator.consoles, function (consoleName) {
                consoleName = consoleName.toLowerCase();
                if (consoles[consoleName]) consoles[consoleName].addEmulator(emulatorName, emulator);
            });
        });

        loadShortcutsFile().then(function (shortcutsFile) {
            generateShortcuts(consoles, shortcutsFile);
        });
    });
});
//# sourceMappingURL=index.js.map