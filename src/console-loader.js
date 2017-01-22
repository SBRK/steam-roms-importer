import {loadConfigObject, getUserConfigDirectory} from './user-config';
import _ from 'lodash';

import GameConsole from './game-console';
import Emulator from './emulator';

let loadEmulators = (consoles) =>
{
    return new Promise((resolve, reject) =>
    {
        loadConfigObject('emulators', Emulator).then((emulators) => resolve({consoles: consoles, emulators: emulators}));
    });
}

export function loadConsoles(callback)
{
    loadConfigObject('consoles', GameConsole).then(loadEmulators).then(({consoles, emulators}) =>
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

        callback(null, consoles);
    });
}