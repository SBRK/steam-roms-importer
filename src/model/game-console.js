import fs from 'fs';
import path from 'path';

import { Game } from './index';
import { each, keys } from '../util';

export default class GameConsole {
  constructor(jsonFilePath) {
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

    this.filePath = jsonFilePath;

    this.name = jsonData.name || '';
    this.shortName = jsonData.shortName || '';
    this.tags = jsonData.tags || [];
    this.prefix = jsonData.prefix || '';
    this.icon = jsonData.icon || '';
    this.romPaths = jsonData.romPaths || [];
    this.extensions = jsonData.extensions || [];
    this.emulators = {};
    this.emulator = jsonData.emulator || 0;
    this.romsConfig = {};

    if (this.icon && this.icon.length) {
      const iconsPath = path.join(this.getConfigPath(), 'icons');

      this.icon = path.resolve(iconsPath, path.normalize(this.icon));
    }

    this.loadRomsConfig();
  }

  getConfigPath() {
    return path.resolve(path.join(__dirname, '../', 'config'));
  }

  updateFromUserJsonFile(jsonFilePath) {
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

    this.name = jsonData.name || this.name;
    this.shortName = jsonData.shortName || this.shortName;
    this.tags = jsonData.tags || this.tags;
    this.prefix = jsonData.prefix || this.prefix;
    this.icon = jsonData.icon || this.icon;
    this.romPaths = jsonData.romPaths || this.romPaths;
    this.extensions = jsonData.extensions || this.extensions;
    this.emulator = jsonData.emulator || this.emulator;

    if (this.icon && this.icon === jsonData.icon) {
      const iconsPath = path.join(this.getConfigPath(), 'icons');

      this.icon = path.resolve(iconsPath, path.normalize(this.icon));
    }
  }

  generateUserJsonFile(jsonFilePath) {
    const content = {
      name: this.name,
      romPaths: [],
      emulator: '',
      tags: this.tags,
      prefix: this.prefix,
      extensions: this.extensions,
    };

    const contentJsonString = JSON.stringify(content, null, 4);

    fs.writeFileSync(jsonFilePath, contentJsonString);

    console.log(`Generated user config file for console ${this.name} at ${jsonFilePath}`);
  }

  addEmulator(emulatorName, emulator) {
    this.emulators[emulatorName] = emulator;
  }

  getEmulator() {
    const emulatorNames = keys(this.emulators);

    if (!emulatorNames.length) return null;
    if (!this.emulator) return this.emulators[emulatorNames[0]];

    return this.emulators[this.emulator];
  }

  loadRomsConfig() {
    const fileName = path.basename(this.filePath).replace('.json', '.roms');

    const p = path.join(global.USER_CONFIG_DIR, 'consoles', fileName);

    if (fs.existsSync(p)) this.romsConfig = JSON.parse(fs.readFileSync(p));
  }

  saveRomsConfig() {
    const fileName = path.basename(this.filePath).replace('.json', '.roms');

    const p = path.join(global.USER_CONFIG_DIR, 'consoles', fileName);

    if (keys(this.romsConfig).length) fs.writeFileSync(p, JSON.stringify(this.romsConfig, null, 2));
  }

  getRomConfig(name) {
    const config = this.romsConfig[name] || {
      enabled: true,
      grid: '',
    };

    this.romsConfig[name] = config;

    return config;
  }

  toObject() {
    return {
      name: this.name,
      shortName: this.shortName,
      tags: this.tags,
      prefix: this.prefix,
      icon: this.icon,
      romPaths: this.romPaths,
      extensions: this.extensions,
    };
  }

  searchGames() {
    const games = [];

    each(this.romPaths, (romPath) => {
      const romDir = path.normalize(romPath);

      if (!fs.existsSync(romDir)) {
        console.error(`Directory does not exist: ${romDir}`);
      } else {
        const entries = fs.readdirSync(romDir);

        each(entries, (entry) => {
          const p = path.join(romDir, entry);
          const s = fs.statSync(p);

          if (s.isFile()) {
            const ext = path.extname(entry).replace(/^\./, '');

            if (this.extensions.includes(ext)) {
              const gameConfig = this.getRomConfig(entry);
              games.push(new Game(this, p, gameConfig));
            }
          }
        });
      }
    });

    this.games = games;

    this.saveRomsConfig();
  }
}
