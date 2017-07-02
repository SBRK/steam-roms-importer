import path from 'path';

export default class Game {
  constructor(console, filePath, gameConfig = {}) {
    this.console = console;
    this.filePath = filePath;
    this.ext = path.extname(filePath);
    this.fileName = path.basename(filePath);
    this.name = path.basename(filePath, this.ext);
    this.cleanName = this.cleanRomName(this.name);
    this.exportToSteam = false;
    this.grid = gameConfig.grid || '';
    this.enabled = true;

    if (gameConfig.enabled !== undefined && gameConfig.enabled === false) this.enabled = false;

    this.ignore = !this.enabled || this.shouldGameBeIgnored(this.cleanName);
  }

  cleanRomName(name) {
    let result = name;
    result = result.replace(/\([^)]\)/gi, '');
    result = result.replace(/\[[^\]]\]/gi, '');
    result = result.replace(/ +/, ' ');
    result = result.replace(/ $/, '');

    if (result.indexOf(', The') !== -1) result = `The ${result.replace(', The', '')}`;

    return result;
  }

  shouldGameBeIgnored(name) {
    if (name.match(/CD {0,1}[2-9]/)) return true;

    return false;
  }
}
