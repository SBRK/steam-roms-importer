'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Emulator = function () {
    function Emulator(jsonFilePath) {
        _classCallCheck(this, Emulator);

        var jsonData = JSON.parse(_fs2.default.readFileSync(jsonFilePath));

        this.name = _path2.default.basename(jsonFilePath, _path2.default.extname(jsonFilePath));

        this.consoles = jsonData.consoles || [];

        this.exe = jsonData.exe ? _path2.default.normalize(jsonData.exe) : '';
        this.command = jsonData.command || '{exe} {game}';
    }

    _createClass(Emulator, [{
        key: 'updateFromUserJsonFile',
        value: function updateFromUserJsonFile(jsonFilePath) {
            var jsonData = JSON.parse(_fs2.default.readFileSync(jsonFilePath));

            this.consoles = jsonData.consoles || this.consoles;

            this.exe = _path2.default.normalize(jsonData.exe || this.exe);
            this.command = jsonData.command || this.command;
        }
    }, {
        key: 'generateUserJsonFile',
        value: function generateUserJsonFile(jsonFilePath) {
            var content = {
                exe: this.exe,
                command: this.command,
                consoles: this.consoles
            };

            var contentJsonString = JSON.stringify(content, null, 4);

            _fs2.default.writeFileSync(jsonFilePath, contentJsonString);

            console.log('Generated user config file for emulator ' + this.name + ' at ' + jsonFilePath);
        }
    }, {
        key: 'getCommandForGame',
        value: function getCommandForGame(game) {
            return this.command.replace('{exe}', '"' + this.exe + '"').replace('{game}', '"' + game.filePath + '"');
        }
    }]);

    return Emulator;
}();

exports.default = Emulator;
//# sourceMappingURL=emulator.js.map