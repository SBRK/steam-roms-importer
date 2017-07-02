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

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

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

            (0, _each2.default)(subFolders, function (subFolder) {
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
        return exts.indexOf(_path2.default.extname(entry).replace(/^\./, '')) != -1;
      });

      resolve(filteredFiles);
    });
  });
};

async function loadConfigObject(name, objClass) {
  var result = {};
  var configPath = _path2.default.join(__dirname, 'config', name);
  var userConfigPath = '';

  var jsonFiles = await listFiles(configPath, ['json']);

  (0, _each2.default)(jsonFiles, function (file) {
    var name = _path2.default.basename(file, '.json').toLowerCase();
    file = _path2.default.join(configPath, file);

    result[name] = new objClass(file);
  });

  var userConfigDir = await getUserConfigDirectory();
  userConfigPath = _path2.default.join(userConfigDir, name);

  if (!_fs2.default.existsSync(userConfigPath)) _fs2.default.mkdirSync(userConfigPath);

  for (var _name in result) {
    var p = _path2.default.join(userConfigPath, _name + '.json');

    if (!_fs2.default.existsSync(p)) result[_name].generateUserJsonFile(p);
  }

  var userJsonFiles = await listFiles(userConfigPath, ['json']);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = userJsonFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var file = _step.value;

      var _name2 = _path2.default.basename(file, '.json').toLowerCase();
      file = _path2.default.join(userConfigPath, file);

      if (result[_name2]) result[_name2].updateFromUserJsonFile(file);else result[_name2] = new objClass(file);
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

  return result;
};
//# sourceMappingURL=user-config.js.map