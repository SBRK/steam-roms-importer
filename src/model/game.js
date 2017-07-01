import path from 'path'

let cleanRomName = (name) =>
{
    name = name.replace(/\([^\)]\)/gi, '');
    name = name.replace(/\[[^\]]\]/gi, '');
    name = name.replace(/ +/, ' ');
    name = name.replace(/ $/, '');

    if (name.indexOf(', The') != -1)
        name = `The ${name.replace(', The', '')}`;

    return name;
}

let shouldGameBeIgnored = (name) =>
{
    if (name.match(/CD {0,1}[2-9]/))
        return true;

    return false;
}

export default class Game {
    constructor(console, filePath, gameConfig = {})
    {
        this.console = console;
        this.filePath = filePath;
        this.ext = path.extname(filePath);
        this.fileName = path.basename(filePath);
        this.name = path.basename(filePath, this.ext);
        this.cleanName = cleanRomName(this.name);
        this.exportToSteam = false;
        this.grid = gameConfig.grid || '';
        this.enabled = true;

        if (gameConfig.enabled !== undefined && gameConfig.enabled === false)
            this.enabled = false;

        this.ignore = !this.enabled || shouldGameBeIgnored(this.cleanName);
    }
}
