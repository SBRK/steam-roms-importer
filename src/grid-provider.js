import async from 'async';
import superagent from 'superagent';

let searchSteamGridDB = (game, callback) =>
{
    return new Promise((resolve, reject) =>
    {
        game = game.replace(/ - /gi, ': ').replace(/-/gi, ' ').replace(/CD {0,1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');
        console.log(game);
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

export function findGridImages (game, console="")
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
}