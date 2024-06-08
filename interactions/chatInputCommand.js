const { connectToDatabase, closeDatabase } = require('../db');
const strings = require('../util/strings.js');

module.exports = {
    async execute(interaction) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(strings.interactionCreate.noCommand(interaction.commandName));
            return;
        }

        try {
            await connectToDatabase();
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: strings.interactionCreate.commandFollowUpError, ephemeral: true });
            } else {
                await interaction.reply({ content: strings.interactionCreate.commandFollowUpReply, ephemeral: true });
            }
        } finally {
            await closeDatabase();
        }
    },
};