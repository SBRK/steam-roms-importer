"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _nodeSteamShortcuts = require('node-steam-shortcuts');

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _int64Buffer = require('int64-buffer');

var _ramda = require('ramda');

var r = _interopRequireWildcard(_ramda);

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

                this.shortcuts = r.map(function (s) {
                    return new _nodeSteamShortcuts.Shortcut(s);
                }, r.filter(function (s) {
                    return s.ShortcutPath != defaultShortcutPath;
                }, this.shortcuts));

                console.log(this.shortcuts);
            } catch (e) {
                console.error(e);
            }
        }
    }, {
        key: 'addShortcut',
        value: function addShortcut(shortcut) {
            var s = new _nodeSteamShortcuts.Shortcut(shortcut);

            s.ShortcutPath = defaultShortcutPath;
            s.custom = "toto";

            this.shortcuts.push(s);
            return s;
        }
    }, {
        key: 'writeShortcuts',
        value: function writeShortcuts(callback) {
            var data = _nodeSteamShortcuts.Builder.build(this.shortcuts);

            fs.writeFile(this.filePath, data, function (error) {
                return callback(error);
            });
        }
    }]);

    return ShortcutFile;
}();

exports.default = ShortcutFile;
//# sourceMappingURL=shortcut-file.js.map