'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadConsoles = undefined;

var _userConfig = require('../user-config');

var _model = require('../model');

var _util = require('../util');

var loadConsoles = async function loadConsoles() {
  var consoles = await (0, _userConfig.loadConfigObject)('consoles', _model.GameConsole);
  var emulators = await (0, _userConfig.loadConfigObject)('emulators', _model.Emulator);

  (0, _util.each)((0, _util.keys)(emulators), async function (emulatorName) {
    var emulator = emulators[emulatorName];

    (0, _util.each)(emulator.consoles, function (name) {
      var consoleName = name.toLowerCase();

      if (consoles[consoleName]) {
        consoles[consoleName].addEmulator(emulatorName, emulator);
      }
    });
  });

  return consoles;
};

exports.default = loadConsoles;
exports.loadConsoles = loadConsoles;