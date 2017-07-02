
import { getUserConfigDirectory } from './user-config';
import loadConsoles from './service/console-loader';
import { getSteamConfigPath, loadShortcutsFile, generateShortcuts } from './service/shortcuts-loader';
import findGridImages from './service/grid-provider';

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
}

main();
