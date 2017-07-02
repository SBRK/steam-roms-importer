'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
  function Game(console, filePath) {
    var gameConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Game);

    this.console = console;
    this.filePath = filePath;
    this.ext = _path2.default.extname(filePath);
    this.fileName = _path2.default.basename(filePath);
    this.name = _path2.default.basename(filePath, this.ext);
    this.cleanName = this.cleanRomName(this.name);
    this.exportToSteam = false;
    this.grid = gameConfig.grid || '';
    this.enabled = true;

    if (gameConfig.enabled !== undefined && gameConfig.enabled === false) this.enabled = false;

    this.ignore = !this.enabled || this.shouldGameBeIgnored(this.cleanName);
  }

  _createClass(Game, [{
    key: 'cleanRomName',
    value: function cleanRomName(name) {
      var result = name;
      result = result.replace(/\([^)]\)/gi, '');
      result = result.replace(/\[[^\]]\]/gi, '');
      result = result.replace(/ +/, ' ');
      result = result.replace(/ $/, '');

      if (result.indexOf(', The') !== -1) result = 'The ' + result.replace(', The', '');

      return result;
    }
  }, {
    key: 'shouldGameBeIgnored',
    value: function shouldGameBeIgnored(name) {
      if (name.match(/CD {0,1}[2-9]/)) return true;

      return false;
    }
  }]);

  return Game;
}();

exports.default = Game;