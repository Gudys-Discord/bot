const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createautomod')
        .setDescription('Cria um sistema de automoderação')
        .addSubcommand(command => command.setName('flagged-words').setDescription('Adiciona palavras proibidas ao sistema de automoderação'))
        .addSubcommand(command => command.setName('spam-messages').setDescription('Adiciona um sistema de detecção de spam de mensagens'))
        .addSubcommand(command => command.setName('spam-mentions').setDescription('Adiciona um sistema de detecção de spam de menções'))
        .addSubcommand(command => command.setName('keywords').setDescription('Adiciona palavras-chave ao sistema de automoderação')),

    async execute(interaction) {
        // This command creates an automod rule in all 9 servers that are in the devServer variable
        const devServers = ['1256971261310013471', '1256971183514062899', '1256971018267005010',
            '1240514457298276402', '1240720918314221679',
            '1240720983908683828', '1240720956461158533',
            '1240721047347789884', '1240721072890970275'
        ];

        for (const guildId of devServers) {
            const guild = await interaction.client.guilds.fetch(guildId);
            const channel = guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));

            if (channel) {
                await channel.send({ content: 'Regras de automoderação criadas com sucesso!' });
            }
        }
    }
};