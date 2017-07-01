import Winreg from 'winreg';
import path from 'path';
import fs from 'fs';
import each from 'lodash/each';
import {resolveEnvPath} from './util';

export function getUserConfigDirectory()
{
    return new Promise((resolve, reject) =>
    {
        var regKey = new Winreg(
        {
            hive: Winreg.HKCU,
            key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders'
        });

        var myDocFolder = regKey.values((err, items) =>
        {
            for (var i in items)
            {
                if (items[i].name === 'Personal')
                {
                    let dir = resolveEnvPath(path.join(items[i].value, 'steam-roms'));

                    if (!fs.existsSync(dir))
                        fs.mkdirSync(dir);

                    let subFolders = ['consoles', 'emulators', 'icons'];

                    each(subFolders, (subFolder) =>
                    {
                        let subFolderPath = path.join(dir, subFolder);

                        if (!fs.existsSync(subFolderPath))
                            fs.mkdirSync(subFolderPath);
                    });

                    resolve(dir);
                }
            }
        });
    });
}

let listFiles = (p, exts) =>
{
    return new Promise((resolve, reject) =>
    {
        fs.readdir(p, (err, entries) =>
        {
            let filteredFiles = entries.filter((entry) =>
            {
                return exts.indexOf(path.extname(entry).replace(/^\./, '')) != -1;
            });

            resolve(filteredFiles);
        });
    });
}

export async function loadConfigObject(name, objClass)
{
    let result = {};
    let configPath = path.join(__dirname, 'config', name);
    let userConfigPath = ''

    const jsonFiles = await listFiles(configPath, ['json']);

    each(jsonFiles, (file) =>
    {
        let name = path.basename(file, '.json').toLowerCase();
        file = path.join(configPath, file);

        result[name] = new objClass(file);
    });

    const userConfigDir = await getUserConfigDirectory()
    userConfigPath = path.join(userConfigDir, name);

    if (!fs.existsSync(userConfigPath))
        fs.mkdirSync(userConfigPath);

    for (const name in result)
    {
        let p = path.join(userConfigPath, `${name}.json`);

        if (!fs.existsSync(p))
            result[name].generateUserJsonFile(p);
    }

    const userJsonFiles = await listFiles(userConfigPath, ['json'])
    for (let file of userJsonFiles)
    {
        let name = path.basename(file, '.json').toLowerCase();
        file = path.join(userConfigPath, file);

        if (result[name])
            result[name].updateFromUserJsonFile(file);
        else
            result[name] = new objClass(file);
    }

    return result;
};
