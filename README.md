# steam-roms-importer
Add your roms as Steam shortcuts

Usage: 

`npm install`

`npm run build`

`npm start`

Upon running the script for the first time, config files will be generated in `My Documents\steam-roms\*`.

In the `consoles` folder, you will find configuration files for consoles. In each json file, you will have to specify the `romPaths` parameter for the script to find your roms, for example: 

```
{
	"romPaths": ["D:/Roms/SNES", "C:/Roms/SNES"]
}
```

In the `emulators` folder, you will find configuration files for emulators. In each json file, you will have to specify `exe`, the path to the executable of the emulator and `command`, the command line executed when running the emulator. In this command, `{exe}` represents the path to the emulator exe, and `{game}` is the path to the rom, for example:

```
{
    "exe": "D:/Emulators/Dolphin/Dolphin.exe",
    "command": "{exe} /e {game} /b"
}
```

Once you changed all of your console and emulator config files, run the script again with `npm start` and you should see the games being added to the Steam shortcut file. Restart Steam to see them in your library.

