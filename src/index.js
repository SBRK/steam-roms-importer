
import {loadConfigObject, getUserConfigDirectory} from './user-config';
import {loadConsoles} from './console-loader';
import {getSteamConfigPath, loadShortcutsFile, generateShortcuts} from './shortcuts-loader';
import {findGridImages} from './grid-provider';
import async from 'async';
import _ from 'lodash';

getUserConfigDirectory().then((userConfigDir) =>
{
    global.USER_CONFIG_DIR = userConfigDir;

    async.waterfall([
        loadConsoles,
        (consoles, callback) =>
        {
            loadShortcutsFile().then(shortcutsFile => callback(null, consoles, shortcutsFile));
        },
        (consoles, shortcutsFile, callback) =>
        {
            generateShortcuts({consoles: consoles, shortcutsFile: shortcutsFile}, callback);
        },
        (games, callback) =>
        {
            findGridImages({games: games, steamConfigPath: getSteamConfigPath()}, callback);
        }
    ],
    (error, result) =>
    {
        console.log('All done !');
    });
});
