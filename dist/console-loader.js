'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadConsoles = loadConsoles;

var _userConfig = require('./user-config');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _gameConsole = require('./game-console');

var _gameConsole2 = _interopRequireDefault(_gameConsole);

var _emulator = require('./emulator');

var _emulator2 = _interopRequireDefault(_emulator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadEmulators = function loadEmulators(consoles) {
    return new Promise(function (resolve, reject) {
        (0, _userConfig.loadConfigObject)('emulators', _emulator2.default).then(function (emulators) {
            return resolve({ consoles: consoles, emulators: emulators });
        });
    });
};

function loadConsoles(callback) {
    (0, _userConfig.loadConfigObject)('consoles', _gameConsole2.default).then(loadEmulators).then(function (_ref) {
        var consoles = _ref.consoles,
            emulators = _ref.emulators;

        _lodash2.default.each(emulators, function (emulator, emulatorName) {
            _lodash2.default.each(emulator.consoles, function (consoleName) {
                consoleName = consoleName.toLowerCase();

                if (consoles[consoleName]) consoles[consoleName].addEmulator(emulatorName, emulator);
            });
        });

        callback(null, consoles);
    });
}
//# sourceMappingURL=console-loader.js.map