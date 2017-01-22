'use strict';

var _userConfig = require('./user-config');

var _consoleLoader = require('./console-loader');

var _shortcutsLoader = require('./shortcuts-loader');

var _gridProvider = require('./grid-provider');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _userConfig.getUserConfigDirectory)().then(function (userConfigDir) {
    global.USER_CONFIG_DIR = userConfigDir;

    _async2.default.waterfall([_consoleLoader.loadConsoles, function (consoles, callback) {
        (0, _shortcutsLoader.loadShortcutsFile)().then(function (shortcutsFile) {
            return callback(null, consoles, shortcutsFile);
        });
    }, function (consoles, shortcutsFile, callback) {
        (0, _shortcutsLoader.generateShortcuts)({ consoles: consoles, shortcutsFile: shortcutsFile }, callback);
    }, function (games, callback) {
        (0, _gridProvider.findGridImages)({ games: games, steamConfigPath: (0, _shortcutsLoader.getSteamConfigPath)() }, callback);
    }], function (error, result) {
        console.log('All done !');
    });
});
//# sourceMappingURL=index.js.map