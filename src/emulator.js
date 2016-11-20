import fs from 'fs';
import path from 'path';

export default class Emulator {
    constructor(jsonFilePath)
    {
        let jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

        this.consoles = jsonData.consoles || [];
        
        this.exe = path.normalize(jsonData.exe || '');
        this.command = jsonData.command || '{exe} {game}';
    }

    updateFromJsonFile(jsonFilePath)
    {
        let jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

        this.consoles = jsonData.consoles || this.consoles;
        
        this.exe = path.normalize(jsonData.exe || this.exe);
        this.command = jsonData.command || this.command;
    }

    getCommandForGame(game)
    {
        return this.command
            .replace('{exe}', '"' + this.exe + '"')
            .replace('{game}', '"' + game.filePath + '"');
    }
}