import Winreg from 'winreg';
import path from 'path';
import fs from 'fs';
import { resolveEnvPath, each, keys } from './util';

export const getUserConfigDirectory = () => new Promise((resolve) => {
  const regKey = new Winreg({
    hive: Winreg.HKCU,
    key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders',
  });

  regKey.values((err, items) => each(items, (item) => {
    if (item.name === 'Personal') {
      const dir = resolveEnvPath(path.join(item.value, 'steam-roms'));

      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const subFolders = ['consoles', 'emulators', 'icons'];

      each(subFolders, (subFolder) => {
        const subFolderPath = path.join(dir, subFolder);

        if (!fs.existsSync(subFolderPath)) fs.mkdirSync(subFolderPath);
      });

      resolve(dir);
    }
  }));
});

const listFiles = (p, exts) => new Promise((resolve) => {
  fs.readdir(p, (err, entries) => {
    const filteredFiles = entries.filter(entry => exts.indexOf(path.extname(entry).replace(/^\./, '')) !== -1);
    resolve(filteredFiles);
  });
});

export const loadConfigObject = async (name, ObjClass) => {
  const result = {};
  const configPath = path.join(__dirname, 'config', name);
  let userConfigPath = '';

  const jsonFiles = await listFiles(configPath, ['json']);

  each(jsonFiles, (jsonFile) => {
    const fileName = path.basename(jsonFile, '.json').toLowerCase();
    const file = path.join(configPath, jsonFile);

    result[fileName] = new ObjClass(file);
  });

  const userConfigDir = await getUserConfigDirectory();
  userConfigPath = path.join(userConfigDir, name);

  if (!fs.existsSync(userConfigPath)) fs.mkdirSync(userConfigPath);

  each(keys(result), (fileName) => {
    const p = path.join(userConfigPath, `${name}.json`);

    if (!fs.existsSync(p)) result[fileName].generateUserJsonFile(p);
  });

  const userJsonFiles = await listFiles(userConfigPath, ['json']);
  each(userJsonFiles, (userJsonFile) => {
    const fileName = path.basename(userJsonFile, '.json').toLowerCase();
    const file = path.join(userConfigPath, userJsonFile);

    if (result[fileName]) result[fileName].updateFromUserJsonFile(file);
    else result[fileName] = new ObjClass(file);
  });

  return result;
};
