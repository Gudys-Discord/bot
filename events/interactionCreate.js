const { Events } = require('discord.js');
const chatInputCommand = require('../interactions/chatInputCommand');
const selectMenu = require('../interactions/selectMenu');
const modalSubmit = require('../interactions/modalSubmit');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.guildId !== '737173603107340310') return interaction.reply({ content: 'Este bot não pode ser utilizado aqui', ephemeral: true });
        if (interaction.isChatInputCommand()) {
            await chatInputCommand.execute(interaction);
        } else if (interaction.isSelectMenu()) {
            await selectMenu.execute(interaction);
        } else if (interaction.isModalSubmit()) {
            await modalSubmit.execute(interaction);
        }
    },
};