'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getUserConfigDirectory = getUserConfigDirectory;
exports.loadConfigObject = loadConfigObject;

var _winreg = require('winreg');

var _winreg2 = _interopRequireDefault(_winreg);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getUserConfigDirectory() {
    return new Promise(function (resolve, reject) {
        var regKey = new _winreg2.default({
            hive: _winreg2.default.HKCU,
            key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders'
        });

        var myDocFolder = regKey.values(function (err, items) {
            for (var i in items) {
                if (items[i].name === 'Personal') {
                    (function () {
                        var dir = (0, _util.resolveEnvPath)(_path2.default.join(items[i].value, 'steam-roms'));

                        if (!_fs2.default.existsSync(dir)) _fs2.default.mkdirSync(dir);

                        var subFolders = ['consoles', 'emulators', 'icons'];

                        _lodash2.default.each(subFolders, function (subFolder) {
                            var subFolderPath = _path2.default.join(dir, subFolder);

                            if (!_fs2.default.existsSync(subFolderPath)) _fs2.default.mkdirSync(subFolderPath);
                        });

                        resolve(dir);
                    })();
                }
            }
        });
    });
}

var listFiles = function listFiles(p, exts) {
    return new Promise(function (resolve, reject) {
        _fs2.default.readdir(p, function (err, entries) {
            var filteredFiles = entries.filter(function (entry) {
                return exts.indexOf(_path2.default.extname(entry).replace(/^\./, '') != -1);
            });

            resolve(filteredFiles);
        });
    });
};

function loadConfigObject(name, objClass) {
    return new Promise(function (resolve, reject) {
        var result = {};
        var configPath = _path2.default.join(__dirname, "config", name);
        var userConfigPath = '';

        _async2.default.waterfall([function (callback) {
            return listFiles(configPath, ['json']).then(function (jsonFiles) {
                return callback(null, jsonFiles);
            });
        }, function (jsonFiles, callback) {
            _lodash2.default.each(jsonFiles, function (file) {
                var name = _path2.default.basename(file, '.json').toLowerCase();
                file = _path2.default.join(configPath, file);

                result[name] = new objClass(file);
            });

            return callback(null);
        }, function (callback) {
            return getUserConfigDirectory().then(function (userConfigDir) {
                return callback(null, userConfigDir);
            });
        }, function (userConfigDir, callback) {
            userConfigPath = _path2.default.join(userConfigDir, name);

            if (!_fs2.default.existsSync(userConfigPath)) _fs2.default.mkdirSync(userConfigPath);

            listFiles(userConfigPath, ['json']).then(function (jsonFiles) {
                return callback(null, jsonFiles);
            });
        }, function (jsonFiles, callback) {
            _lodash2.default.each(jsonFiles, function (file) {
                var name = _path2.default.basename(file, '.json').toLowerCase();
                file = _path2.default.join(userConfigPath, file);

                if (result[name]) result[name].updateFromUserJsonFile(file);else result[name] = new objClass(file);
            });

            return callback(null);
        }], function (err) {
            resolve(result);
        });
    });
};
//# sourceMappingURL=user-config.js.map