import fs from 'fs';
import path from 'path';
import Game from './game';
import _ from 'lodash';
import {getUserConfigDirectory} from './user-config';

export default class GameConsole {
    constructor(jsonFilePath)
    {
        let jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

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

        if (this.icon && this.icon.length)
        {
            let configPath = path.join(__dirname, 'config', 'icons');

            this.icon = path.resolve(configPath, path.normalize(this.icon));
        }

        this.loadRomsConfig();
    }

    updateFromUserJsonFile(jsonFilePath)
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

    loadRomsConfig()
    {
        let fileName = path.basename(this.filePath).replace('.json', '.roms');

        let p = path.join(global.USER_CONFIG_DIR, 'consoles', fileName);

        if (fs.existsSync(p))
            this.romsConfig = JSON.parse(fs.readFileSync(p));
    }

    saveRomsConfig()
    {
        let fileName = path.basename(this.filePath).replace('.json', '.roms');

        let p = path.join(global.USER_CONFIG_DIR, 'consoles', fileName);

        if (_.keys(this.romsConfig).length)
            fs.writeFileSync(p, JSON.stringify(this.romsConfig, null, 2));
    }

    getRomConfig(name)
    {
        let config = this.romsConfig[name] || {
            enabled: true,
            grid: ""
        } 

        this.romsConfig[name] = config;

        return config;
    }

    toObject()
    {
        return {
            name: this.name,
            shortName: this.shortName,
            tags: this.tags,
            prefix: this.prefix,
            icon: this.icon,
            romPaths: this.romPaths,
            extensions: this.extensions
        };
    }

    searchGames()
    {
        let games = [];

        for (let dir of this.romPaths)
        {
            dir = path.normalize(dir);
            if (!fs.existsSync(dir))
            {
                console.error('Directory does not exist: ' + dir);
                continue;
            }
            
            let entries = fs.readdirSync(dir);
            
            for (let entry of entries)
            {
                let p = path.join(dir, entry);
                let s = fs.statSync(p);

                if (!s.isFile())
                    continue;

                let ext = path.extname(entry).replace(/^\./, '');

                if (this.extensions.indexOf(ext) != -1)
                {
                    let gameConfig = this.getRomConfig(entry);                
                    games.push(new Game(this, p, gameConfig));
                }
            }
        }

        this.games = games;

        this.saveRomsConfig();
    }
}