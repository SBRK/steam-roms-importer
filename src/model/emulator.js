import fs from 'fs';
import path from 'path';

export default class Emulator {
    constructor(jsonFilePath)
    {
        let jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

        this.name = path.basename(jsonFilePath, path.extname(jsonFilePath));

        this.consoles = jsonData.consoles || [];

        this.exe = jsonData.exe ? path.normalize(jsonData.exe) : '';
        this.command = jsonData.command || '{exe} {game}';
    }

    updateFromUserJsonFile(jsonFilePath)
    {
        let jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

        this.consoles = jsonData.consoles || this.consoles;

        this.exe = path.normalize(jsonData.exe || this.exe);
        this.command = jsonData.command || this.command;
    }

    generateUserJsonFile(jsonFilePath)
    {
        var content = {
            exe: this.exe,
            command: this.command,
            consoles: this.consoles
        }

        var contentJsonString = JSON.stringify(content, null, 4);

        fs.writeFileSync(jsonFilePath, contentJsonString);

        console.log(`Generated user config file for emulator ${this.name} at ${jsonFilePath}`);
    }

    getCommandForGame(game)
    {
        return this.command
            .replace('{exe}', `"${this.exe}"`)
            .replace('{game}', `"${game.filePath}"`);
    }
}
