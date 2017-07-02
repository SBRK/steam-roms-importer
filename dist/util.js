'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timeout = exports.keys = exports.map = exports.each = exports.resolveEnvPath = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var each = function each(a, fn) {
  var results = _lodash2.default.map(a, fn);
  var promises = _lodash2.default.filter(results, function (r) {
    return r && r.then && _lodash2.default.isFunction(r.then);
  });

  if (promises.length) return _bluebird2.default.all(promises);

  return undefined;
};

var map = function map(a, fn) {
  var results = _lodash2.default.map(a, fn);
  var promises = _lodash2.default.filter(results, function (r) {
    return r && r.then && _lodash2.default.isFunction(r.then);
  });

  if (promises.length) {
    return new _bluebird2.default(function (resolve) {
      _bluebird2.default.map(promises, async function (promise) {
        var index = results.indexOf(promise);
        var result = await promise;

        results.splice(index, 1, result);
      }).then(function () {
        return resolve(results);
      });
    });
  }

  return results;
};

var timeout = function timeout(ms) {
  return new _bluebird2.default(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var resolveEnvPath = function resolveEnvPath(dir) {
  var r = new RegExp(/%([a-zA-Z_]+)%/);

  var match = r.exec(dir);

  var result = dir;

  while (match && match.length) {
    result = result.replace(match[0], process.env[match[1]]);
    match = r.exec(result);
  }

  return result;
};

var keys = _lodash2.default.keys;

exports.resolveEnvPath = resolveEnvPath;
exports.each = each;
exports.map = map;
exports.keys = keys;
exports.timeout = timeout;