const { Events } = require('discord.js');
const chatInputCommand = require('../interactions/chatInputCommand');
const selectMenu = require('../interactions/selectMenu');
const button = require('../interactions/button');
const modalSubmit = require('../interactions/modalSubmit');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            await chatInputCommand.execute(interaction);
        } else if (interaction.isSelectMenu()) {
            await selectMenu.execute(interaction);
        } else if (interaction.isModalSubmit()) {
            await modalSubmit.execute(interaction);
        }
    },
};