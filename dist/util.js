"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveEnvPath = resolveEnvPath;
function resolveEnvPath(dir) {
  var r = new RegExp(/%([a-zA-Z_]+)%/);

  var match = r.exec(dir);

  while (match && match.length) {
    dir = dir.replace(match[0], process.env[match[1]]);
    match = r.exec(dir);
  }

  return dir;
}
//# sourceMappingURL=util.js.map