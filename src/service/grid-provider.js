import superagent from 'superagent';
import path from 'path';
import fs from 'fs';
import request from 'request';
import 'colors';

import { each, keys } from '../util';

const cleanName = (name) => {
  const gameName = name
    .replace(/ - /gi, ': ')
    .replace(/-/gi, ' ')
    .replace(/CD {0,1}[0-9]/gi, '')
    .replace(/ +/gi, ' ')
    .replace(/ $/, '');

  return gameName;
};

const localGridImage = async (gameName, consoleName, romFilePath) => {
  const gridImagePath = romFilePath.replace(/\.[^/.]+$/, '.png');
  const images = [];
  if (fs.existsSync(gridImagePath)) {
    images.push({
      image: gridImagePath,
      thumbnail: gridImagePath,
    });
  }
  return images;
};

const searchSteamGridDB = async (gameName) => {
  const game = cleanName(gameName);
  const url = `http://www.steamgriddb.com/search.php?name=${encodeURIComponent(game)}`;

  let error;
  let response;

  try {
    response = await superagent
      .get(url)
      .set('Accept', 'application/json');
  } catch (e) {
    error = e;
  }

  if (error || !response.ok) {
    throw (new Error(`could not get ${url}`));
  }

  const images = [];
  const data = JSON.parse(response.text);

  each(data, (d) => {
    if ((typeof d === 'object') && d.grid_link) {
      images.push({
        image: d.grid_link,
        thumbnail: d.thumbnail_link,
      });
    }
  });

  return images;
};

const searchConsoleGridDB = async (gameName, consoleName) => {
  const game = cleanName(gameName);

  const shortCodes = {
    N64: ['NINTENDO64'],
    SNES: ['SUPERNES', 'SUPERNINTENDO', 'SUPERFAMICOM', 'SFC', 'SFM'],
    NES: ['NES', 'FAMICOM', 'NINTENDO', 'NINTENDOENTERTAINMENTSYSTEM'],
    GAMEBOY: ['GB', 'NINTENDOGAMEBOY', 'NINTENDOGB', 'NGB', 'GAMEBOYCOLOR', 'GBC', 'NINTENDOGAMEBOYCOLOR', 'NINTENDOGBC', 'NGBC', 'SUPERGAMEBOY', 'SGB', 'NINTENDOSUPERGAMEBOY', 'NINTENDOSGB', 'NSGB'],
    GAMECUBE: ['GC', 'NGC', 'NINTENDOGC', 'NINTENDOGAMECUBE', 'DOLPHIN', 'NINTENDODOLPHIN'],
    WII: ['NINTENDOWII'],
    GBA: ['GAMEBOYADVANCE', 'GAMEBOYADVANCESP', 'NINTENDOGBA', 'GBADVANCE', 'NINTENDOGBADVANCE', 'GBAM', 'GBASP', 'GAMEBOYADVANCEMICRO', 'GBAMICRO'],
    DS: ['NINTENDODS', 'NDS', 'DUALSCREEN', 'NINTENDODUALSCREEN', 'DSLITE', 'DSI', 'DSILITE', 'NINTENDODSLITE'],
    PS1: ['PLAYSTATION', 'SONYPLAYSTATION', 'PSX', 'PS', 'SONYPSX'],
  };

  const findShortCode = (name) => {
    const c = name
      .replace(/\s/g, '')
      .toUpperCase();

    let result = name;

    each(keys(shortCodes), (shortCode) => {
      if (shortCodes[shortCode].indexOf(c) !== -1) result = shortCode;
    });

    return result;
  };

  const consoleShortCode = await findShortCode(consoleName);
  const url = `http://consolegrid.com/api/top_picture?console=${consoleShortCode}&game=${encodeURIComponent(game)}`;

  let error;
  let response;

  try {
    response = await superagent.get(url);
  } catch (err) {
    error = err;
  }

  if (error || !response.ok) {
    throw (new Error(`could not get ${url}`));
  }

  const images = [];
  const data = response.text.split('\n');

  each(data, (d) => {
    images.push({
      image: d,
      thumbnail: d,
    });
  });

  return images;
};

const gridProviders = [
  localGridImage,
  searchSteamGridDB,
  searchConsoleGridDB,
];

const findGridImage = async (gameName, consoleName = '', romFilePath = '') => {
  let images = [];

  await each(gridProviders, async (searchFunction) => {
    try {
      const foundImages = await searchFunction(gameName, consoleName, romFilePath);
      images = images.concat(foundImages);
    } catch (e) {
    }
  });

  return images;
};

const findGridImages = async (games, steamConfigPath) => {
  console.log('');
  console.log(`Searching for grid images for ${games.length.toString().green} games`);
  console.log('');

  await each(games, async (game) => {
    const { gameName, consoleName, appid, romFilePath } = game;

    const gridPath = path.join(steamConfigPath, 'grid');
    const filePath = path.join(gridPath, `${appid}.png`);

    if (!fs.existsSync(gridPath)) fs.mkdirSync(gridPath);

    if (!fs.existsSync(filePath)) {
      const images = await findGridImage(gameName, consoleName, romFilePath);
      let foundImages = false;

      if (images && images.length) {
        try {
          if (images[0].image.indexOf('http') === 0) {
            // remote read
            const response = await request.get(images[0].image);
            response.pipe(fs.createWriteStream(filePath));

            foundImages = true;
          } else {
            // local read
            const localFileContents = fs.readFileSync(images[0].image);
            fs.writeFileSync(filePath, localFileContents);

            foundImages = true;
          }
        } catch (err) {
          foundImages = false;
        }
      }

      if (foundImages) console.log(`  ${'+'.green} Found grid for ${gameName.bgBlack.white} (${consoleName})`);
      else console.warn(`  ${'!!'.red} No grid image found for ${gameName.bgBlack.white} (${consoleName})`);
    } else {
      console.warn(`  ${'-'.grey} Grid image for ${gameName.bgBlack.white} (${consoleName}) already exists, skipping.`);
    }
  });

  console.log('');
};

export { findGridImages, findGridImage };
export default findGridImages;
