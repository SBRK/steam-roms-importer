import fs from 'fs';
import path from 'path';
import 'colors';

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

    console.log('');
    console.log(`Generating shortcuts for ${gameConsole.name.red}...`.bgGreen.white);

    if (emulator) {
      if (gameConsole.games && gameConsole.games.length) {
        console.log(`  Adding ${gameConsole.games.length.toString().green} games for ${gameConsole.name.grey}.`);
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

            console.log(`    ${'+'.green} Added game ${game.cleanName.bgBlack.white} with APP ID ${appid.grey}`);

            games.push({
              gameName: game.cleanName,
              consoleName: gameConsole.name,
              appid,
            });
          } else {
            console.log(`    - Ignoring game "${game.cleanName}" (${gameConsole.name})`.grey);
          }
        });
      } else {
        console.warn(`  ${'!!'.red} No games found for ${gameConsole.name}, not adding any games.`);
      }
    } else {
      console.warn(`  ${'!!'.red} No emulator found for ${gameConsole.name}, not adding any games.`);
    }

    console.log('');
  });

  await shortcutsFile.writeShortcuts();
  console.log(`** Shortcuts file saved, ${games.length.toString().green} games added ! **`.bgBlue);
  console.log('')

  return games;
}
