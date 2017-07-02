import { loadConfigObject } from '../user-config';

import { GameConsole, Emulator } from '../model';

import { each, keys } from '../util';

const loadConsoles = async () => {
  const consoles = await loadConfigObject('consoles', GameConsole);
  const emulators = await loadConfigObject('emulators', Emulator);

  each(keys(emulators), async (emulatorName) => {
    const emulator = emulators[emulatorName];

    each(emulator.consoles, (name) => {
      const consoleName = name.toLowerCase();

      if (consoles[consoleName]) {
        consoles[consoleName].addEmulator(emulatorName, emulator);
      }
    });
  });

  return consoles;
};

export default loadConsoles;
export { loadConsoles };
