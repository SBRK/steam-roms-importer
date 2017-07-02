import Bluebird from 'bluebird';
import _ from 'lodash';

const each = (a, fn) => {
  const results = _.map(a, fn);
  const promises = _.filter(results, r => r && r.then && _.isFunction(r.then));

  if (promises.length) return Bluebird.all(promises);

  return undefined;
};

const map = (a, fn) => {
  const results = _.map(a, fn);
  const promises = _.filter(results, r => r && r.then && _.isFunction(r.then));

  if (promises.length) {
    return new Bluebird((resolve) => {
      Bluebird.map(promises, async (promise) => {
        const index = results.indexOf(promise);
        const result = await promise;

        results.splice(index, 1, result);
      }).then(() => resolve(results));
    });
  }

  return results;
};


const resolveEnvPath = (dir) => {
  const r = new RegExp(/%([a-zA-Z_]+)%/);

  let match = r.exec(dir);

  let result = dir;

  while (match && match.length) {
    result = result.replace(match[0], process.env[match[1]]);
    match = r.exec(result);
  }

  return result;
};

const keys = _.keys;

export {
  resolveEnvPath,
  each,
  map,
  keys,
};
