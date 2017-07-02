import { loadConfigObject } from '../user-config';

import { GameConsole, Emulator } from '../model';

const loadConsoles = async () => {
  const consoles = await loadConfigObject('consoles', GameConsole);
  const emulators = await loadConfigObject('emulators', Emulator);

  for (const emulatorName in emulators) {
    if (emulators[emulatorName]) {
      const emulator = emulators[emulatorName];

      for (let consoleName of emulator.consoles) {
        consoleName = consoleName.toLowerCase();

        if (consoles[consoleName]) {
          consoles[consoleName].addEmulator(emulatorName, emulator);
        }
      }
    }
  }

  return consoles;
}

export default loadConsoles
export { loadConsoles }
