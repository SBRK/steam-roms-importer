'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadConfigObject = exports.getUserConfigDirectory = undefined;

var _winreg = require('winreg');

var _winreg2 = _interopRequireDefault(_winreg);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getUserConfigDirectory = exports.getUserConfigDirectory = function getUserConfigDirectory() {
  return new Promise(function (resolve) {
    var regKey = new _winreg2.default({
      hive: _winreg2.default.HKCU,
      key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders'
    });

    regKey.values(function (err, items) {
      return (0, _util.each)(items, function (item) {
        if (item.name === 'Personal') {
          var dir = (0, _util.resolveEnvPath)(_path2.default.join(item.value, 'steam-roms'));

          if (!_fs2.default.existsSync(dir)) _fs2.default.mkdirSync(dir);

          var subFolders = ['consoles', 'emulators', 'icons'];

          (0, _util.each)(subFolders, function (subFolder) {
            var subFolderPath = _path2.default.join(dir, subFolder);

            if (!_fs2.default.existsSync(subFolderPath)) _fs2.default.mkdirSync(subFolderPath);
          });

          resolve(dir);
        }
      });
    });
  });
};

var listFiles = function listFiles(p, exts) {
  return new Promise(function (resolve) {
    _fs2.default.readdir(p, function (err, entries) {
      var filteredFiles = entries.filter(function (entry) {
        return exts.indexOf(_path2.default.extname(entry).replace(/^\./, '')) !== -1;
      });
      resolve(filteredFiles);
    });
  });
};

var loadConfigObject = exports.loadConfigObject = async function loadConfigObject(name, ObjClass) {
  var result = {};
  var configPath = _path2.default.join(__dirname, 'config', name);
  var userConfigPath = '';

  var jsonFiles = await listFiles(configPath, ['json']);

  (0, _util.each)(jsonFiles, function (jsonFile) {
    var fileName = _path2.default.basename(jsonFile, '.json').toLowerCase();
    var file = _path2.default.join(configPath, jsonFile);

    result[fileName] = new ObjClass(file);
  });

  var userConfigDir = await getUserConfigDirectory();
  userConfigPath = _path2.default.join(userConfigDir, name);

  if (!_fs2.default.existsSync(userConfigPath)) _fs2.default.mkdirSync(userConfigPath);

  (0, _util.each)((0, _util.keys)(result), function (fileName) {
    var p = _path2.default.join(userConfigPath, fileName + '.json');

    if (!_fs2.default.existsSync(p)) {
      global.openUserConfigDir = true;
      result[fileName].generateUserJsonFile(p);
    }
  });

  var userJsonFiles = await listFiles(userConfigPath, ['json']);
  (0, _util.each)(userJsonFiles, function (userJsonFile) {
    var fileName = _path2.default.basename(userJsonFile, '.json').toLowerCase();
    var file = _path2.default.join(userConfigPath, userJsonFile);

    if (result[fileName]) result[fileName].updateFromUserJsonFile(file);else result[fileName] = new ObjClass(file);
  });

  return result;
};