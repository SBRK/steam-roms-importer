
import {loadConfigObject, getUserConfigDirectory} from './user-config';
import {loadConsoles} from './console-loader';
import {getSteamConfigPath, loadShortcutsFile, generateShortcuts} from './shortcuts-loader';
import {findGridImages} from './grid-provider';

process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
});

async function main() {
    const userConfigDir = await getUserConfigDirectory();
    global.USER_CONFIG_DIR = userConfigDir;

    const consoles = await loadConsoles();
    const shortcutsFile = await loadShortcutsFile();
    const games = await generateShortcuts({consoles, shortcutsFile});

    await findGridImages({games, steamConfigPath: getSteamConfigPath()});
    console.log('All done !');
}

try
{
    main()
}
catch (error)
{
    console.error(error)
}
