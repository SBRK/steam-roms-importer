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

export { resolveEnvPath };
