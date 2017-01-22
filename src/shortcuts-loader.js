import ShortcutFile from './shortcut-file';

import fs from 'fs';
import path from 'path';

import _ from 'lodash';

export function getSteamConfigPath()
{
    let users = fs.readdirSync("C:/Program Files (x86)/Steam/userdata/");

    if (!users || !users.length)
        console.error('No steam directory found !');

    let filePath = "C:/Program Files (x86)/Steam/userdata/" + users[0] + "/config";

    return filePath;
}

export function loadShortcutsFile()
{
    return new Promise((resolve, reject) =>
    {
        let filePath = path.join(getSteamConfigPath(), 'shortcuts.vdf');

        let shortcutFile = new ShortcutFile(filePath);

        return resolve(shortcutFile);
    });
}

export function generateShortcuts({consoles, shortcutsFile}, callback)
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

    shortcutsFile.writeShortcuts((error) => callback(error, error ? [] : games));
}