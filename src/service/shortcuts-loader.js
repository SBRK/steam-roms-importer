import fs from 'fs';
import path from 'path';
import { each, keys } from '../util';

import { ShortcutFile } from '../model';

export const getSteamConfigPath = () => {
  const users = fs.readdirSync('C:/Program Files (x86)/Steam/userdata/');

  if (!users || !users.length) throw (new Error('No steam directory found !'));

  const filePath = `C:/Program Files (x86)/Steam/userdata/${users[0]}/config`;

  return filePath;
};

export const loadShortcutsFile = () => new Promise((resolve) => {
  const filePath = path.join(getSteamConfigPath(), 'shortcuts.vdf');

  const shortcutFile = new ShortcutFile(filePath);

  return resolve(shortcutFile);
});

export async function generateShortcuts(consoles, shortcutsFile) {
  const games = [];

  each(keys(consoles), (consoleName) => {
    const gameConsole = consoles[consoleName];

    gameConsole.searchGames();
    const emulator = gameConsole.getEmulator();

    if (emulator) {
      each(gameConsole.games, (game) => {
        const gameShortcut = {
          appname: `${gameConsole.prefix} ${game.cleanName}`,
          exe: emulator.getCommandForGame(game),
          icon: gameConsole.icon,
          tags: gameConsole.tags,
        };

        gameShortcut.appname = gameShortcut.appname.replace(/^ +/, '').replace(/ +$/, '');

        if (!game.ignore) {
          const shortcut = shortcutsFile.addShortcut(gameShortcut);
          const appid = shortcut.getAppID();

          console.log(`Added game "${game.cleanName}" (${gameConsole.name}) to Steam shortcuts with APP ID ${appid}`);

          games.push({
            gameName: game.cleanName,
            consoleName: gameConsole.name,
            appid,
          });
        }
      });
    }
  });

  await shortcutsFile.writeShortcuts();
  console.log('Shortcuts file saved');

  return games;
}
