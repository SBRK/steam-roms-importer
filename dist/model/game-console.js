'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _index = require('./index');

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameConsole = function () {
  function GameConsole(jsonFilePath) {
    _classCallCheck(this, GameConsole);

    var jsonData = JSON.parse(_fs2.default.readFileSync(jsonFilePath));

    this.filePath = jsonFilePath;

    this.name = jsonData.name || '';
    this.shortName = jsonData.shortName || '';
    this.tags = jsonData.tags || [];
    this.prefix = jsonData.prefix || '';
    this.icon = jsonData.icon || '';
    this.romPaths = jsonData.romPaths || [];
    this.extensions = jsonData.extensions || [];
    this.emulators = {};
    this.emulator = jsonData.emulator || 0;
    this.romsConfig = {};

    if (this.icon && this.icon.length) {
      var iconsPath = _path2.default.join(this.getConfigPath(), 'icons');

      this.icon = _path2.default.resolve(iconsPath, _path2.default.normalize(this.icon));
    }

    this.loadRomsConfig();
  }

  _createClass(GameConsole, [{
    key: 'getConfigPath',
    value: function getConfigPath() {
      return _path2.default.resolve(_path2.default.join(__dirname, '../', 'config'));
    }
  }, {
    key: 'updateFromUserJsonFile',
    value: function updateFromUserJsonFile(jsonFilePath) {
      var jsonData = JSON.parse(_fs2.default.readFileSync(jsonFilePath));

      this.name = jsonData.name || this.name;
      this.shortName = jsonData.shortName || this.shortName;
      this.tags = jsonData.tags || this.tags;
      this.prefix = jsonData.prefix || this.prefix;
      this.icon = jsonData.icon || this.icon;
      this.romPaths = jsonData.romPaths || this.romPaths;
      this.extensions = jsonData.extensions || this.extensions;
      this.emulator = jsonData.emulator || this.emulator;

      if (this.icon && this.icon === jsonData.icon) {
        var iconsPath = _path2.default.join(this.getConfigPath(), 'icons');

        this.icon = _path2.default.resolve(iconsPath, _path2.default.normalize(this.icon));
      }
    }
  }, {
    key: 'generateUserJsonFile',
    value: function generateUserJsonFile(jsonFilePath) {
      var content = {
        name: this.name,
        romPaths: [],
        emulator: '',
        tags: this.tags,
        prefix: this.prefix,
        extensions: this.extensions
      };

      var contentJsonString = JSON.stringify(content, null, 4);

      _fs2.default.writeFileSync(jsonFilePath, contentJsonString);

      console.log('Generated user config file for console ' + this.name + ' at ' + jsonFilePath);
    }
  }, {
    key: 'addEmulator',
    value: function addEmulator(emulatorName, emulator) {
      this.emulators[emulatorName] = emulator;
    }
  }, {
    key: 'getEmulator',
    value: function getEmulator() {
      var emulatorNames = (0, _util.keys)(this.emulators);

      if (!emulatorNames.length) return null;
      if (!this.emulator) return this.emulators[emulatorNames[0]];

      return this.emulators[this.emulator];
    }
  }, {
    key: 'loadRomsConfig',
    value: function loadRomsConfig() {
      var fileName = _path2.default.basename(this.filePath).replace('.json', '.roms');

      var p = _path2.default.join(global.USER_CONFIG_DIR, 'consoles', fileName);

      if (_fs2.default.existsSync(p)) this.romsConfig = JSON.parse(_fs2.default.readFileSync(p));
    }
  }, {
    key: 'saveRomsConfig',
    value: function saveRomsConfig() {
      var fileName = _path2.default.basename(this.filePath).replace('.json', '.roms');

      var p = _path2.default.join(global.USER_CONFIG_DIR, 'consoles', fileName);

      if ((0, _util.keys)(this.romsConfig).length) _fs2.default.writeFileSync(p, JSON.stringify(this.romsConfig, null, 2));
    }
  }, {
    key: 'getRomConfig',
    value: function getRomConfig(name) {
      var config = this.romsConfig[name] || {
        enabled: true,
        grid: ''
      };

      this.romsConfig[name] = config;

      return config;
    }
  }, {
    key: 'toObject',
    value: function toObject() {
      return {
        name: this.name,
        shortName: this.shortName,
        tags: this.tags,
        prefix: this.prefix,
        icon: this.icon,
        romPaths: this.romPaths,
        extensions: this.extensions
      };
    }
  }, {
    key: 'searchGames',
    value: function searchGames() {
      var _this = this;

      var games = [];

      (0, _util.each)(this.romPaths, function (romPath) {
        var romDir = _path2.default.normalize(romPath);

        if (!_fs2.default.existsSync(romDir)) {
          console.error('Directory does not exist: ' + romDir);
        } else {
          var entries = _fs2.default.readdirSync(romDir);

          (0, _util.each)(entries, function (entry) {
            var p = _path2.default.join(romDir, entry);
            var s = _fs2.default.statSync(p);

            if (s.isFile()) {
              var ext = _path2.default.extname(entry).replace(/^\./, '');

              if (_this.extensions.includes(ext)) {
                var gameConfig = _this.getRomConfig(entry);
                games.push(new _index.Game(_this, p, gameConfig));
              }
            }
          });
        }
      });

      this.games = games;

      this.saveRomsConfig();
    }
  }]);

  return GameConsole;
}();

exports.default = GameConsole;