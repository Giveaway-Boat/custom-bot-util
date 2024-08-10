const fs = require('fs');
const superagent = require('superagent');

const func = async () => {
    const tokens = fs
        .readFileSync('./tokens')
        .toString()
        .split('\n')
        .map((token) => token.replace(/\r|\s/g, ''));

    let sql = '';
    let inviteLinks = '';
    let success = true;

    for (const token of tokens) {
        if (!token) continue;

        const botID = Buffer.from(token.split('.')[0], 'base64').toString();

        const { bot_public, flags } = (await superagent.get('https://discord.com/api/oauth2/applications/@me').set('Authorization', `Bot ${token}`)).body;

        if (!bot_public) {
            success = false;

            console.log(`Bot not public: Invalid intents for: https://discord.com/developers/applications/${botID}/bot`);
        }

        if (flags !== 557056) {
            success = false;

            console.log(`Invalid intents for: https://discord.com/developers/applications/${botID}/bot`);
        }

        sql += `update custom_bots set token = '${token.replace(/'/g, "''")}', is_token_invalid = null where bot_id = '${botID.replace(/'/g, "''")}';\n`;
    }

    if (success) {
        fs.writeFileSync('./updatebots.sql', sql);
        fs.writeFileSync('./invitelinks', inviteLinks);
    }
};

func();
