import superagent from 'superagent';
import path from 'path';
import fs from 'fs';
import request from 'request'

let searchSteamGridDB = async (game) =>
{
    game = game.replace(/ - /gi, ': ').replace(/-/gi, ' ').replace(/CD {0,1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');
    let url = `http://www.steamgriddb.com/search.php?name=${encodeURIComponent(game)}`;

    let error, response

    try
    {
        response = await superagent
            .get(url)
            .set('Accept', 'application/json')
    }
    catch (e)
    {
        error = e
    }

    if (error || !response.ok)
    {
        throw(new Error(`could not get ${url}`));
    }

    let images = [];
    let data = JSON.parse(response.text);

    for (let d of data)
    {
        if (!(typeof d === 'object'))
            continue;

        if (d['grid_link'])
        {
            images.push({
                image: d['grid_link'],
                thumbnail: d['thumbnail_link']
           });
        }
    }

    return images;
}

let searchConsoleGridDB = async (game, console) =>
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

    let findShortCode = (gameConsole) =>
    {
        let c = gameConsole.replace(/\s/g, '').toUpperCase();

        for (let shortCode in shortCodes)
        {
            if (shortCodes[shortCode].indexOf(c) != -1)
                return shortCode;
        }

        return gameConsole;
    }

    game = game.replace('-', ' ').replace(/CD {0-1}[0-9]/gi, '').replace(/ +/gi, ' ').replace(/ $/, '');

    let url = `http://consolegrid.com/api/top_picture?console=${findShortCode(gameConsole)}&game=${encodeURIComponent(game)}`;

    let error, response

    try
    {
        response = await superagent.get(url)
    }
    catch (e)
    {
        error = e
    }

    if (error || !response.ok)
    {
        throw(new Error(`could not get ${url}`));
    }

    let images = [];
    let data = response.text.split('\n');

    for (let d of data)
    {
        images.push({
            image: d,
            thumbnail: d
        });
    }

    return images;
}

let gridProviders = [
    searchSteamGridDB,
    searchConsoleGridDB
];

async function findGridImage (game, gameConsole='')
{
    let images = []

    for (const searchFunction of gridProviders)
    {
        try
        {
            const foundImages = await searchFunction(game, gameConsole);
            images = images.concat(foundImages);
        }
        catch (e)
        {
            continue;
        }
    }

    return images;
};

export async function findGridImages ({games, steamConfigPath})
{
    for (const game of games)
    {
        const {gameName, consoleName, appid} = game;

        let gridPath = path.join(steamConfigPath, 'grid');

        if (!fs.existsSync(gridPath))
            fs.mkdirSync(gridPath);

        let filePath = path.join(gridPath, `${appid}.png`);

        if (fs.existsSync(filePath))
        {
            console.warn(`Grid image for ${gameName} already exists, skipping.`);
            continue;
        }

        const images = await findGridImage(gameName, consoleName)

        if (images && images.length)
        {
            try
            {
                const response = await request.get(images[0].image)
                console.log(`Found grid for ${gameName}`);

                response.pipe(fs.createWriteStream(filePath))
            }
            catch(e)
            {
                console.warn(`No grid image found for ${gameName}`);
            }
        }
        else
        {
            console.warn(`No grid image found for ${gameName}`);
        }
    }
}
