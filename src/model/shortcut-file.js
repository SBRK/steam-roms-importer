import * as fs from 'fs';
import { Parser as VDFParser, Builder as VDFBuilder, Shortcut } from 'node-steam-shortcuts';
import * as r from 'ramda';

const defaultShortcutPath = 'steam-roms-importer';

export default class ShortcutFile {
    constructor(filePath)
    {
        this.filePath = filePath;
        this.shortcuts = [];

        this._readFile();
    }

    _readFile()
    {
        if (!fs.existsSync(this.filePath))
            return;

        let data = fs.readFileSync(this.filePath);

        try
        {
            this.shortcuts = VDFParser.parse(data).toJSON();

            this.shortcuts = r.map(
                (s) => new Shortcut(s),
                r.filter(
                    s => s.ShortcutPath != defaultShortcutPath,
                    this.shortcuts)
            );
        }
        catch(e)
        {
            console.error(e);
        }
    }

    addShortcut(shortcut)
    {
        let s = new Shortcut(shortcut);

        s.ShortcutPath = defaultShortcutPath;

        this.shortcuts.push(s);
        return s;
    }

    async writeShortcuts()
    {
        const self = this
        return new Promise(function(resolve, reject) {
            var data = VDFBuilder.build(self.shortcuts);

            fs.writeFile(self.filePath, data, (error) => {
                if (error) return reject(error);
                return resolve();
            });
        });
    }
}
