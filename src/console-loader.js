import {loadConfigObject, getUserConfigDirectory} from './user-config';

import GameConsole from './game-console';
import Emulator from './emulator';

export async function loadConsoles()
{
    const consoles = await loadConfigObject('consoles', GameConsole);
    const emulators = await loadConfigObject('emulators', Emulator);

    for (const emulatorName in emulators)
    {
        const emulator = emulators[emulatorName]

        for (let consoleName of emulator.consoles)
        {
            consoleName = consoleName.toLowerCase();

            if (consoles[consoleName])
                consoles[consoleName].addEmulator(emulatorName, emulator);
        }
    }

    return consoles;
}
