import async from 'async';
import superagent from 'superagent';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';

let searchSteamGridDB = (game, callback) =>
{
    return new Promise((resolve, reject) =>
    {
        game = game.replace(/ - /gi, ': ').replace(/-/gi, ' ').replace(/CD {0,1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');
        let url = `http://www.steamgriddb.com/search.php?name=${encodeURIComponent(game)}`;

        superagent
            .get(url)
            .set('Accept', 'application/json')
            .end((err, res) =>
            {
                if (err || !res.ok) 
                    return reject({message: 'could not get '});

                let images = [];
                let data = JSON.parse(res.text);

                for (let d of data)
                {
                    if (!(typeof d === 'object'))
                        continue;

                    if (d['grid_link'])
                        images.push({
                            image: d['grid_link'],
                            thumbnail: d['thumbnail_link']
                        });
                }

                return resolve(images);
            });
    });
}

let searchConsoleGridDB = (game, console) =>
{
    return new Promise((resolve, reject) =>
    {
        let shortCodes = {
            'N64': ['NINTENDO64'],
            'SNES': ['SUPERNES', 'SUPERNINTENDO', 'SUPERFAMICOM', 'SFC', 'SFM'],
            'NES': ['NES', 'FAMICOM', 'NINTENDO', 'NINTENDOENTERTAINMENTSYSTEM'],
            'GAMEBOY': ['GB', 'NINTENDOGAMEBOY', 'NINTENDOGB', 'NGB', 'GAMEBOYCOLOR', 'GBC', 'NINTENDOGAMEBOYCOLOR', 'NINTENDOGBC', 'NGBC', 'SUPERGAMEBOY', 'SGB', 'NINTENDOSUPERGAMEBOY', 'NINTENDOSGB', 'NSGB'],
            'GAMECUBE': ['GC', 'NGC', 'NINTENDOGC', 'NINTENDOGAMECUBE', 'DOLPHIN', 'NINTENDODOLPHIN'],
            'WII': ['NINTENDOWII'],
            'GBA': ['GAMEBOYADVANCE', 'GAMEBOYADVANCESP', 'NINTENDOGBA', 'GBADVANCE', 'NINTENDOGBADVANCE', 'GBAM', 'GBASP', 'GAMEBOYADVANCEMICRO', 'GBAMICRO'],
            'DS': ['NINTENDODS', 'NDS', 'DUALSCREEN', 'NINTENDODUALSCREEN', 'DSLITE', 'DSI', 'DSILITE', 'NINTENDODSLITE'],
            'PS1': ['PLAYSTATION', 'SONYPLAYSTATION', 'PSX', 'PS', 'SONYPSX']
        }

        let findShortCode = (console) =>
        {
            let c = console.replace(/\s/g, '').toUpperCase();

            for (let shortCode in shortCodes)
            {
                if (shortCodes[shortCode].indexOf(c) != -1)
                    return shortCode;
            }

            return console;
        }

        game = game.replace('-', ' ').replace(/CD {0-1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');

        let url = `http://consolegrid.com/api/top_picture?console=${findShortCode(console)}&game=${encodeURIComponent(game)}`;

        superagent
            .get(url)
            .end((err, res) =>
            {
                if (err || !res.ok) 
                    return reject({message: 'could not get anything from consolegrid'});

                let images = [];
                let data = res.text.split('\n');

                for (let d of data)
                {
                    images.push({
                        image: d,
                        thumbnail: d
                    });
                }

                return resolve(images);
            });
    });
}

let gridProviders = [
    searchSteamGridDB,
    searchConsoleGridDB
];

function findGridImage (game, console="")
{
    return new Promise((resolve, reject) =>
    {
        async.concat(
            gridProviders, 
            (searchFunction, callback) =>
            {
                searchFunction(game, console)
                    .then((images) => callback(null, images))
                    .catch((e) => callback(null, []));
            },
            (error, images) =>
            {
                resolve(images);
            }
        );
    });
};

export function findGridImages ({games, steamConfigPath}, callback)
{
    async.mapSeries(
        games, 
        ({gameName, consoleName, appid}, callback) =>
        {
            let gridPath = path.join(steamConfigPath, 'grid');

            if (!fs.existsSync(gridPath))
                fs.mkdirSync(gridPath);

            let filePath = path.join(gridPath, appid + '.png');

            if (fs.existsSync(filePath))
            {
                console.warn(`Grid image for ${gameName} already exists, skipping.`);
                return callback(null);
            }

            findGridImage(gameName, consoleName).then((images) => 
            {
                if (timedOut)
                    return;

                if (images && images.length)
                {
                    let url = images[0].image;
                    let request = (url.indexOf('https:') != -1) ? https : http;

                    try
                    {
                        request.get(url, (response) =>
                        {
                            let file = fs.createWriteStream(filePath);

                            console.log('Found grid for ' + gameName);

                            response.pipe(file)
                            return callback(null);
                        });
                    }
                    catch(e)
                    {
                        console.warn(`No grid image found for ${gameName}`);
                        return callback(null);
                    }
                }
                else
                {
                    console.warn(`No grid image found for ${gameName}`);
                    return callback(null);
                }

                console.log('nope');
            });
        },
        (error) =>
        {
            callback(error);
        }
    );
}