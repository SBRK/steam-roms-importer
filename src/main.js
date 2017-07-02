import child from 'child_process';
import loadConsoles from './service/console-loader';
import findGridImages from './service/grid-provider';
import { getUserConfigDirectory } from './user-config';
import { getSteamConfigPath, loadShortcutsFile, generateShortcuts } from './service/shortcuts-loader';
import { timeout } from './util';

const isWin = /^win/.test(process.platform);

if (!isWin) {
  throw (new Error('This script is only supported on Windows'));
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});

async function main() {
  global.USER_CONFIG_DIR = await getUserConfigDirectory();

  const consoles = await loadConsoles();
  const shortcutsFile = await loadShortcutsFile();
  const games = await generateShortcuts(consoles, shortcutsFile);

  await findGridImages(games, getSteamConfigPath());

  console.log('All done !');
  if (global.openUserConfigDir) {
    console.log('Opening user config folder in 3 seconds');
    await timeout(500);
    console.log('3...');
    await timeout(1000);
    console.log('2...');
    await timeout(1000);
    console.log('1...');
    await timeout(1000);
    console.log(`Opening user config folder ${global.USER_CONFIG_DIR}`);
    await timeout(500);
    child.exec(`start "" "${global.USER_CONFIG_DIR}"`);
  }
}

main();
