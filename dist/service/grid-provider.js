'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findGridImages = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

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

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var d = _step.value;

      if ((typeof d === 'undefined' ? 'undefined' : _typeof(d)) === 'object' && d.grid_link) {
        images.push({
          image: d.grid_link,
          thumbnail: d.thumbnail_link
        });
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

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

    for (var shortCode in shortCodes) {
      if (shortCodes[shortCode].indexOf(c) !== -1) return shortCode;
    }

    return name;
  };

  var url = 'http://consolegrid.com/api/top_picture?console=' + findShortCode(consoleName) + '&game=' + encodeURIComponent(game);

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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var d = _step2.value;

      images.push({
        image: d,
        thumbnail: d
      });
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return images;
};

var gridProviders = [searchSteamGridDB, searchConsoleGridDB];

var findGridImage = async function findGridImage(gameName) {
  var consoleName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var images = [];

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = gridProviders[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var searchFunction = _step3.value;

      try {
        var foundImages = await searchFunction(gameName, consoleName);
        images = images.concat(foundImages);
      } catch (e) {}
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return images;
};

var findGridImages = async function findGridImages(games, steamConfigPath) {
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = games[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var game = _step4.value;
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

        if (foundImages) console.log('Found grid for ' + gameName);else console.warn('No grid image found for ' + gameName);
      } else {
        console.warn('Grid image for ' + gameName + ' already exists, skipping.');
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }
};

exports.findGridImages = findGridImages;
exports.default = findGridImages;
//# sourceMappingURL=grid-provider.js.map