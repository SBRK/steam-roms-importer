import { ipcRenderer } from 'electron';


let id = 0;
const promiseCallbacks = {};

ipcRenderer.on('getConsoles-callback', (event, requestId, error, consoles) => {
  if (!requestId || !promiseCallbacks[requestId.toString()] && requestId !== id) {
    return;
  }

  const {
    resolve,
    reject,
  } = promiseCallbacks[requestId.toString()];

  if (error) {
    return reject(error);
  }

  return resolve(consoles);
});

const getConsoles = () => {
  id += 1;

  return new Promise((resolve, reject) => {
    promiseCallbacks[id.toString()] = { resolve, reject };

    ipcRenderer.send('getConsoles', id);
  });
};

export {
  getConsoles,
};
