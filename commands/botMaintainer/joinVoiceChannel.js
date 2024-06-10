const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinvoice')
        .setDescription('Entra no canal de voz definido.')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('O canal de voz para entrar.')
                .setRequired(true)
                .addChannelTypes([ChannelType.GuildVoice])),
    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');

        interaction.reply(`Conectando ao canal de voz ${channel.name}...`);

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        connection.on('stateChange', async (oldState, newState) => {
            if (newState.status === 'ready') {
                await interaction.update(`Conectado ao canal de voz ${channel.name}!`);
            } else if (newState.status === 'failed') {
                await interaction.update(`Falha ao conectar ao canal de voz ${channel.name}!`);
            }
        });
    },
};
