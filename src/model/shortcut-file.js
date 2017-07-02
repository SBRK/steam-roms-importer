import * as fs from 'fs';
import map from 'lodash/map';
import filter from 'lodash/filter';

import { Parser as VDFParser, Builder as VDFBuilder, Shortcut } from 'node-steam-shortcuts';

const defaultShortcutPath = 'steam-roms-importer';

export default class ShortcutFile {
  constructor(filePath) {
    this.filePath = filePath;
    this.shortcuts = [];

    this._readFile();
  }

  _readFile() {
    if (!fs.existsSync(this.filePath)) return;

    const data = fs.readFileSync(this.filePath);

    try {
      this.shortcuts = VDFParser.parse(data).toJSON();

      this.shortcuts = filter(this.shortcuts, s => s.ShortcutPath !== defaultShortcutPath);
      this.shortcuts = map(this.shortcuts, s => new Shortcut(s));
    } catch (e) {
      console.error(e);
    }
  }

  addShortcut(shortcut) {
    const s = new Shortcut(shortcut);

    s.ShortcutPath = defaultShortcutPath;

    this.shortcuts.push(s);
    return s;
  }

  async writeShortcuts() {
    const self = this;

    return new Promise((resolve, reject) => {
      const data = VDFBuilder.build(self.shortcuts);

      fs.writeFile(self.filePath, data, (error) => {
        if (error) return reject(error);
        return resolve();
      });
    });
  }
}
