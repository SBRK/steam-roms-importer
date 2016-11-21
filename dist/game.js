'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cleanRomName = function cleanRomName(name) {
    name = name.replace(/\([^\)]\)/gi, '');
    name = name.replace(/\[[^\]]\]/gi, '');
    name = name.replace(/ +/, ' ');
    name = name.replace(/ $/, '');

    if (name.indexOf(', The') != -1) name = 'The ' + name.replace(', The', '');

    return name;
};

var shouldGameBeIgnored = function shouldGameBeIgnored(name) {
    if (name.match(/CD {0,1}[2-9]/)) return true;

    return false;
};

var Game = function Game(console, filePath) {
    _classCallCheck(this, Game);

    this.console = console;
    this.filePath = filePath;
    this.ext = _path2.default.extname(filePath);
    this.fileName = _path2.default.basename(filePath);
    this.name = _path2.default.basename(filePath, this.ext);
    this.cleanName = cleanRomName(this.name);
    this.exportToSteam = false;

    this.ignore = shouldGameBeIgnored(this.cleanName);
};

exports.default = Game;
//# sourceMappingURL=game.js.map