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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchSteamGridDB = function searchSteamGridDB(game, callback) {
    return new Promise(function (resolve, reject) {
        game = game.replace(/ - /gi, ': ').replace(/-/gi, ' ').replace(/CD {0,1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');
        console.log(game);
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

function findGridImages(game) {
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
}
//# sourceMappingURL=grid-provider.js.map