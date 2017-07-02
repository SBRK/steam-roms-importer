'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _userConfig = require('../user-config');

var _model = require('../model');

exports.default = async function loadConsoles() {
  var consoles = await (0, _userConfig.loadConfigObject)('consoles', _model.GameConsole);
  var emulators = await (0, _userConfig.loadConfigObject)('emulators', _model.Emulator);

  for (var emulatorName in emulators) {
    var emulator = emulators[emulatorName];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = emulator.consoles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var consoleName = _step.value;

        consoleName = consoleName.toLowerCase();

        if (consoles[consoleName]) {
          consoles[consoleName].addEmulator(emulatorName, emulator);
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

  return consoles;
};
//# sourceMappingURL=console-loader.js.map