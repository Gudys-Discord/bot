const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

async function main() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions
        ]
    });

    client.commands = new Discord.Collection();

    // Command handler
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }

    // Event files
    fs.readdir('./events/', (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            const event = require(`./events/${file}`);
            let eventName = file.split(".")[0];
            client.on(eventName, event.bind(null, client));
        });
    });

    client.once('ready', () => {
        console.log('Client ready.');
    });

    await client.login(process.env.PROD_TOKEN);
}

main().catch(console.error);