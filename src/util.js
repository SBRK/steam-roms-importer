export function resolveEnvPath(dir)
{
    let r = new RegExp(/%([a-zA-Z_]+)%/);

    let match = r.exec(dir);

    while(match && match.length)
    {
        dir = dir.replace(match[0], process.env[match[1]]);
        match = r.exec(dir);
    }

    return dir;
}