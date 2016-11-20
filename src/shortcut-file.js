"use strict";

import * as fs from 'fs';
import {Parser as VDFParser, Builder as VDFBuilder, Shortcut} from 'node-steam-shortcuts';
import crc from 'crc';
import {Uint64BE} from 'int64-buffer';
import * as r from 'ramda';

export default class ShortcutFile {
    constructor(filePath)
    {
        this.filePath = filePath;
        this.shortcuts = {};

        this._readFile();
    }

    _readFile()
    {
        let data = fs.readFileSync(this.filePath);

        this.shortcuts = VDFParser.parse(data).toJSON();

        this.shortcuts = r.map((s) => new Shortcut(s), this.shortcuts);
    }

    addShortcut(shortcut)
    {
        let s = new Shortcut(shortcut);

        this.shortcuts.push(s);
        return s;
    }

    writeShortcuts()
    {
        var data = VDFBuilder.build(this.shortcuts);

        fs.writeFile(this.filePath, data);
    }
}