import fs from 'fs';
import path from 'path';
import Game from './game';
import _ from 'lodash';

export default class GameConsole {
    constructor(jsonFilePath)
    {
        let jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

        this.name = jsonData.name || '';
        this.shortName = jsonData.shortName || '';
        this.tags = jsonData.tags || [];
        this.prefix = jsonData.prefix || '';
        this.icon = jsonData.icon || '';
        this.romPaths = jsonData.romPaths || [];
        this.extensions = jsonData.extensions || [];
        this.emulators = {};
        this.emulator = jsonData.emulator || 0;

        if (this.icon && this.icon.length)
        {
            let configPath = path.join(__dirname, 'config', 'icons');

            this.icon = path.resolve(configPath, path.normalize(this.icon));
        }

        this.searchGames();
    }

    updateFromJsonFile(jsonFilePath)
    {
        let jsonData = JSON.parse(fs.readFileSync(jsonFilePath));
        
        this.name = jsonData.name || this.name;
        this.shortName = jsonData.shortName || this.shortName;
        this.tags = jsonData.tags || this.tags;
        this.prefix = jsonData.prefix || this.prefix;
        this.icon = jsonData.icon || this.icon;
        this.romPaths = jsonData.romPaths || this.romPaths;
        this.extensions = jsonData.extensions || this.extensions;
        this.emulator = jsonData.emulator || this.emulator;

        if (this.icon && this.icon.length)
        {
            let configPath = path.join(__dirname, 'config', 'icons');

            this.icon = path.resolve(configPath, path.normalize(this.icon));
        }

        this.searchGames();
    }

    addEmulator(emulatorName, emulator)
    {
        this.emulators[emulatorName] = emulator;
    }

    getEmulator()
    {
        let emulatorNames = _.keys(this.emulators);

        if (!emulatorNames.length)
            return null;

        if (!this.emulator)
            return this.emulators[emulatorNames[0]];

        return this.emulators[this.emulator];
    }

    searchGames()
    {
        let games = [];

        for (let dir of this.romPaths)
        {
            let entries = fs.readdirSync(path.normalize(dir));
            
            for (let entry of entries)
            {
                let p = path.join(dir, entry);
                let s = fs.statSync(p);

                if (!s.isFile())
                    continue;

                let ext = path.extname(entry).replace(/^\./, '');

                if (this.extensions.indexOf(ext) != -1)
                    games.push(new Game(this, p));
            }
        }

        this.games = games;
    }
}