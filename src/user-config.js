import Winreg from 'winreg';
import path from 'path';
import fs from 'fs';
import async from 'async';
import _ from 'lodash';
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

                    _.each(subFolders, (subFolder) =>
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

export function loadConfigObject(name, objClass)
{
    return new Promise((resolve, reject) =>
    {
        let result = {};
        let configPath = path.join(__dirname, "config", name);
        let userConfigPath = ''

        async.waterfall(
        [
            (callback) => listFiles(configPath, ['json']).then((jsonFiles) => callback(null, jsonFiles)),
            (jsonFiles, callback) =>
            {
                _.each(jsonFiles, (file) =>
                {
                    let name = path.basename(file, '.json').toLowerCase();
                    file = path.join(configPath, file);

                    result[name] = new objClass(file);
                });

                return callback(null);
            },
            (callback) => getUserConfigDirectory().then((userConfigDir) => callback(null, userConfigDir)),
            (userConfigDir, callback) => 
            {
                userConfigPath = path.join(userConfigDir, name);

                if (!fs.existsSync(userConfigPath))
                    fs.mkdirSync(userConfigPath);

                listFiles(userConfigPath, ['json']).then((jsonFiles) => callback(null, jsonFiles));
            },
            (jsonFiles, callback) =>
            {
                _.each(jsonFiles, (file) =>
                {
                    let name = path.basename(file, '.json').toLowerCase();
                    file = path.join(userConfigPath, file);

                    if (result[name])
                        result[name].updateFromUserJsonFile(file);
                    else
                        result[name] = new objClass(file);
                });

                return callback(null);
            }
        ],
        (err) =>
        {
            resolve(result);
        }
        );
    });
};