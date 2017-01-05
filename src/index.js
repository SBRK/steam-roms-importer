import ShortcutFile from './shortcut-file';
import {findGridImages} from './grid-provider';
import {loadConfigObject, getUserConfigDirectory} from './user-config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import async from 'async';
import _ from 'lodash';

import GameConsole from './game-console';
import Emulator from './emulator';

let loadConsoles = () =>
{
    return loadConfigObject('consoles', GameConsole);
}

let loadEmulators = (consoles) =>
{
    return new Promise((resolve, reject) =>
    {
        loadConfigObject('emulators', Emulator).then((emulators) => resolve({consoles: consoles, emulators: emulators}));
    });
}

let getSteamConfigPath = () =>
{
    let users = fs.readdirSync("C:/Program Files (x86)/Steam/userdata/");

    if (!users || !users.length)
        console.error('No steam directory found !');

    let filePath = "C:/Program Files (x86)/Steam/userdata/" + users[0] + "/config";

    return filePath;
}

let loadShortcutsFile = () =>
{
    return new Promise((resolve, reject) =>
    {
        let filePath = path.join(getSteamConfigPath(), 'shortcuts.vdf');

        let shortcutFile = new ShortcutFile(filePath);

        return resolve(shortcutFile);
    });
}

let generateShortcuts = (consoles, shortcutsFile) =>
{
    let games = [];

    _.each(consoles, (gameConsole, name) =>
    {
        gameConsole.searchGames();
        let emulator = gameConsole.getEmulator();

        if (!emulator)
            return;

        _.each(gameConsole.games, (game) =>
        {
            let gameShortcut = {
                appname: gameConsole.prefix + ' ' + game.cleanName,
                exe: emulator.getCommandForGame(game),
                icon: gameConsole.icon,
                tags: gameConsole.tags,
            }

            gameShortcut.appname = gameShortcut.appname.replace(/^ +/, '').replace(/ +$/, '');

            if (!game.ignore)
            {
                let shortcut = shortcutsFile.addShortcut(gameShortcut);

                games.push({
                    gameName: game.cleanName,
                    consoleName: gameConsole.name,
                    appid: shortcut.getAppID()
                });
            }
        });
    });

    shortcutsFile.writeShortcuts();

    findGridImages(games, getSteamConfigPath());
}

getUserConfigDirectory().then((userConfigDir) =>
{
    global.USER_CONFIG_DIR = userConfigDir;

    loadConsoles().then(loadEmulators).then(({consoles, emulators}) =>
    {
        _.each(emulators, (emulator, emulatorName) =>
        {
            _.each(emulator.consoles, (consoleName) =>
            {
                consoleName = consoleName.toLowerCase();
                if (consoles[consoleName])
                    consoles[consoleName].addEmulator(emulatorName, emulator);
            });
        });

        loadShortcutsFile().then((shortcutsFile) => {
            generateShortcuts(consoles, shortcutsFile);
        });
    });
});
