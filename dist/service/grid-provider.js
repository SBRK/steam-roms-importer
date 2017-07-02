'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findGridImage = exports.findGridImages = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

require('colors');

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cleanName = function cleanName(name) {
  var gameName = name.replace(/ - /gi, ': ').replace(/-/gi, ' ').replace(/CD {0,1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');

  return gameName;
};

var searchSteamGridDB = async function searchSteamGridDB(gameName) {
  var game = cleanName(gameName);
  var url = 'http://www.steamgriddb.com/search.php?name=' + encodeURIComponent(game);

  var error = void 0;
  var response = void 0;

  try {
    response = await _superagent2.default.get(url).set('Accept', 'application/json');
  } catch (e) {
    error = e;
  }

  if (error || !response.ok) {
    throw new Error('could not get ' + url);
  }

  var images = [];
  var data = JSON.parse(response.text);

  (0, _util.each)(data, function (d) {
    if ((typeof d === 'undefined' ? 'undefined' : _typeof(d)) === 'object' && d.grid_link) {
      images.push({
        image: d.grid_link,
        thumbnail: d.thumbnail_link
      });
    }
  });

  return images;
};

var searchConsoleGridDB = async function searchConsoleGridDB(gameName, consoleName) {
  var game = cleanName(gameName);

  var shortCodes = {
    N64: ['NINTENDO64'],
    SNES: ['SUPERNES', 'SUPERNINTENDO', 'SUPERFAMICOM', 'SFC', 'SFM'],
    NES: ['NES', 'FAMICOM', 'NINTENDO', 'NINTENDOENTERTAINMENTSYSTEM'],
    GAMEBOY: ['GB', 'NINTENDOGAMEBOY', 'NINTENDOGB', 'NGB', 'GAMEBOYCOLOR', 'GBC', 'NINTENDOGAMEBOYCOLOR', 'NINTENDOGBC', 'NGBC', 'SUPERGAMEBOY', 'SGB', 'NINTENDOSUPERGAMEBOY', 'NINTENDOSGB', 'NSGB'],
    GAMECUBE: ['GC', 'NGC', 'NINTENDOGC', 'NINTENDOGAMECUBE', 'DOLPHIN', 'NINTENDODOLPHIN'],
    WII: ['NINTENDOWII'],
    GBA: ['GAMEBOYADVANCE', 'GAMEBOYADVANCESP', 'NINTENDOGBA', 'GBADVANCE', 'NINTENDOGBADVANCE', 'GBAM', 'GBASP', 'GAMEBOYADVANCEMICRO', 'GBAMICRO'],
    DS: ['NINTENDODS', 'NDS', 'DUALSCREEN', 'NINTENDODUALSCREEN', 'DSLITE', 'DSI', 'DSILITE', 'NINTENDODSLITE'],
    PS1: ['PLAYSTATION', 'SONYPLAYSTATION', 'PSX', 'PS', 'SONYPSX']
  };

  var findShortCode = function findShortCode(name) {
    var c = name.replace(/\s/g, '').toUpperCase();

    var result = name;

    (0, _util.each)((0, _util.keys)(shortCodes), function (shortCode) {
      if (shortCodes[shortCode].indexOf(c) !== -1) result = shortCode;
    });

    return result;
  };

  var consoleShortCode = await findShortCode(consoleName);
  var url = 'http://consolegrid.com/api/top_picture?console=' + consoleShortCode + '&game=' + encodeURIComponent(game);

  var error = void 0;
  var response = void 0;

  try {
    response = await _superagent2.default.get(url);
  } catch (err) {
    error = err;
  }

  if (error || !response.ok) {
    throw new Error('could not get ' + url);
  }

  var images = [];
  var data = response.text.split('\n');

  (0, _util.each)(data, function (d) {
    images.push({
      image: d,
      thumbnail: d
    });
  });

  return images;
};

var gridProviders = [searchSteamGridDB, searchConsoleGridDB];

var findGridImage = async function findGridImage(gameName) {
  var consoleName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var images = [];

  await (0, _util.each)(gridProviders, async function (searchFunction) {
    try {
      var foundImages = await searchFunction(gameName, consoleName);
      images = images.concat(foundImages);
    } catch (e) {}
  });

  return images;
};

var findGridImages = async function findGridImages(games, steamConfigPath) {
  console.log('');
  console.log('Searching for grid images for ' + games.length.toString().green + ' games');
  console.log('');

  await (0, _util.each)(games, async function (game) {
    var gameName = game.gameName,
        consoleName = game.consoleName,
        appid = game.appid;


    var gridPath = _path2.default.join(steamConfigPath, 'grid');
    var filePath = _path2.default.join(gridPath, appid + '.png');

    if (!_fs2.default.existsSync(gridPath)) _fs2.default.mkdirSync(gridPath);

    if (!_fs2.default.existsSync(filePath)) {
      var images = await findGridImage(gameName, consoleName);
      var foundImages = false;

      if (images && images.length) {
        try {
          var response = await _request2.default.get(images[0].image);
          response.pipe(_fs2.default.createWriteStream(filePath));

          foundImages = true;
        } catch (err) {
          foundImages = false;
        }
      }

      if (foundImages) console.log('  ' + '+'.green + ' Found grid for ' + gameName.bgBlack.white + ' (' + consoleName + ')');else console.warn('  ' + '!!'.red + ' No grid image found for ' + gameName.bgBlack.white + ' (' + consoleName + ')');
    } else {
      console.warn('  ' + '-'.grey + ' Grid image for ' + gameName.bgBlack.white + ' (' + consoleName + ') already exists, skipping.');
    }
  });

  console.log('');
};

exports.findGridImages = findGridImages;
exports.findGridImage = findGridImage;
exports.default = findGridImages;