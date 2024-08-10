const fs = require('fs');
const superagent = require('superagent');

const func = async () => {
    const tokens = fs
        .readFileSync('./tokens')
        .toString()
        .split('\n')
        .map((token) => token.replace(/\r|\s/g, ''));

    let sql = `insert INTO custom_bots (bot_id, discriminator, token)\nVALUES `;
    let inviteLinks = '';
    let success = true;

    for (const token of tokens) {
        if (!token) continue;

        const botID = Buffer.from(token.split('.')[0], 'base64').toString();

        const { bot, bot_public, flags } = (await superagent.get('https://discord.com/api/oauth2/applications/@me').set('Authorization', `Bot ${token}`)).body;

        if (!bot_public) {
            success = false;

            console.log(`Bot not public: Invalid intents for: https://discord.com/developers/applications/${botID}/bot`);
        }

        if (flags !== 557056) {
            success = false;

            console.log(`Invalid intents for: https://discord.com/developers/applications/${botID}/bot`);
        }

        sql += `('${botID.replace(/'/g, "''")}', '${bot.discriminator.replace(/'/g, "''")}', '${token.replace(/'/g, "''")}'),\n`;
        inviteLinks += `https://discord.com/api/oauth2/authorize?client_id=${botID}&permissions=0&scope=bot&guild_id=882993059720232990\n`;
    }

    sql = sql.slice(0, -2) + ';';

    if (success) {
        fs.writeFileSync('./addbots.sql', sql);
        fs.writeFileSync('./invitelinks', inviteLinks);
    }
};

func();
