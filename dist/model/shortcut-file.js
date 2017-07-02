'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _filter = require('lodash/filter');

var _filter2 = _interopRequireDefault(_filter);

var _nodeSteamShortcuts = require('node-steam-shortcuts');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultShortcutPath = 'steam-roms-importer';

var ShortcutFile = function () {
  function ShortcutFile(filePath) {
    _classCallCheck(this, ShortcutFile);

    this.filePath = filePath;
    this.shortcuts = [];

    this._readFile();
  }

  _createClass(ShortcutFile, [{
    key: '_readFile',
    value: function _readFile() {
      if (!fs.existsSync(this.filePath)) return;

      var data = fs.readFileSync(this.filePath);

      try {
        this.shortcuts = _nodeSteamShortcuts.Parser.parse(data).toJSON();

        this.shortcuts = (0, _filter2.default)(this.shortcuts, function (s) {
          return s.ShortcutPath !== defaultShortcutPath;
        });
        this.shortcuts = (0, _map2.default)(this.shortcuts, function (s) {
          return new _nodeSteamShortcuts.Shortcut(s);
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, {
    key: 'addShortcut',
    value: function addShortcut(shortcut) {
      var s = new _nodeSteamShortcuts.Shortcut(shortcut);

      s.ShortcutPath = defaultShortcutPath;

      this.shortcuts.push(s);
      return s;
    }
  }, {
    key: 'writeShortcuts',
    value: async function writeShortcuts() {
      var self = this;

      return new Promise(function (resolve, reject) {
        var data = _nodeSteamShortcuts.Builder.build(self.shortcuts);

        fs.writeFile(self.filePath, data, function (error) {
          if (error) return reject(error);
          return resolve();
        });
      });
    }
  }]);

  return ShortcutFile;
}();

exports.default = ShortcutFile;
//# sourceMappingURL=shortcut-file.js.map