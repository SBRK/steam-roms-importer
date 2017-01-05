'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.findGridImages = findGridImages;

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchSteamGridDB = function searchSteamGridDB(game, callback) {
    return new Promise(function (resolve, reject) {
        game = game.replace(/ - /gi, ': ').replace(/-/gi, ' ').replace(/CD {0,1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');
        var url = 'http://www.steamgriddb.com/search.php?name=' + encodeURIComponent(game);

        _superagent2.default.get(url).set('Accept', 'application/json').end(function (err, res) {
            if (err || !res.ok) return reject({ message: 'could not get ' });

            var images = [];
            var data = JSON.parse(res.text);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var d = _step.value;

                    if (!((typeof d === 'undefined' ? 'undefined' : _typeof(d)) === 'object')) continue;

                    if (d['grid_link']) images.push({
                        image: d['grid_link'],
                        thumbnail: d['thumbnail_link']
                    });
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

            return resolve(images);
        });
    });
};

var searchConsoleGridDB = function searchConsoleGridDB(game, console) {
    return new Promise(function (resolve, reject) {
        var shortCodes = {
            'N64': ['NINTENDO64'],
            'SNES': ['SUPERNES', 'SUPERNINTENDO', 'SUPERFAMICOM', 'SFC', 'SFM'],
            'NES': ['NES', 'FAMICOM', 'NINTENDO', 'NINTENDOENTERTAINMENTSYSTEM'],
            'GAMEBOY': ['GB', 'NINTENDOGAMEBOY', 'NINTENDOGB', 'NGB', 'GAMEBOYCOLOR', 'GBC', 'NINTENDOGAMEBOYCOLOR', 'NINTENDOGBC', 'NGBC', 'SUPERGAMEBOY', 'SGB', 'NINTENDOSUPERGAMEBOY', 'NINTENDOSGB', 'NSGB'],
            'GAMECUBE': ['GC', 'NGC', 'NINTENDOGC', 'NINTENDOGAMECUBE', 'DOLPHIN', 'NINTENDODOLPHIN'],
            'WII': ['NINTENDOWII'],
            'GBA': ['GAMEBOYADVANCE', 'GAMEBOYADVANCESP', 'NINTENDOGBA', 'GBADVANCE', 'NINTENDOGBADVANCE', 'GBAM', 'GBASP', 'GAMEBOYADVANCEMICRO', 'GBAMICRO'],
            'DS': ['NINTENDODS', 'NDS', 'DUALSCREEN', 'NINTENDODUALSCREEN', 'DSLITE', 'DSI', 'DSILITE', 'NINTENDODSLITE'],
            'PS1': ['PLAYSTATION', 'SONYPLAYSTATION', 'PSX', 'PS', 'SONYPSX']
        };

        var findShortCode = function findShortCode(console) {
            var c = console.replace(/\s/g, '').toUpperCase();

            for (var shortCode in shortCodes) {
                if (shortCodes[shortCode].indexOf(c) != -1) return shortCode;
            }

            return console;
        };

        game = game.replace('-', ' ').replace(/CD {0-1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');

        var url = 'http://consolegrid.com/api/top_picture?console=' + findShortCode(console) + '&game=' + encodeURIComponent(game);

        _superagent2.default.get(url).end(function (err, res) {
            if (err || !res.ok) return reject({ message: 'could not get anything from consolegrid' });

            var images = [];
            var data = res.text.split('\n');

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

            return resolve(images);
        });
    });
};

var gridProviders = [searchSteamGridDB, searchConsoleGridDB];

function findGridImage(game) {
    var console = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

    return new Promise(function (resolve, reject) {
        _async2.default.concat(gridProviders, function (searchFunction, callback) {
            searchFunction(game, console).then(function (images) {
                return callback(null, images);
            }).catch(function (e) {
                return callback(null, []);
            });
        }, function (error, images) {
            resolve(images);
        });
    });
};

function findGridImages(games, steamConfigPath) {
    _async2.default.mapSeries(games, function (_ref, callback) {
        var gameName = _ref.gameName,
            consoleName = _ref.consoleName,
            appid = _ref.appid;

        var gridPath = _path2.default.join(steamConfigPath, 'grid');

        if (!_fs2.default.existsSync(gridPath)) _fs2.default.mkdirSync(gridPath);

        var filePath = _path2.default.join(gridPath, appid + '.png');

        if (_fs2.default.existsSync(filePath)) {
            console.warn('Grid image for ' + gameName + ' already exists, skipping.');
            return callback(null);
        }

        findGridImage(gameName, consoleName).then(function (images) {
            if (images && images.length) {
                var url = images[0].image;
                var request = url.indexOf('https:') != -1 ? _https2.default : _http2.default;

                try {
                    request.get(url, function (response) {
                        var file = _fs2.default.createWriteStream(filePath);

                        console.log('Found grid for ' + gameName);

                        response.pipe(file);
                        return callback(null);
                    });
                } catch (e) {
                    console.warn('No grid image found for ' + gameName);
                    return callback(null);
                }
            } else {
                console.warn('No grid image found for ' + gameName);
                return callback(null);
            }
        });
    });
}
//# sourceMappingURL=grid-provider.js.map