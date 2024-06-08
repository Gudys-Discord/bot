const { Events } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../db');
const strings = require('../util/strings.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        /*
        * COMMAND HANDLER
        */
        if (interaction.isChatInputCommand()) {
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
        /*
        * SELECT MENU HANDLER
        */
        } else if (interaction.isSelectMenu()) {
            const [action, subcommand, userId] = interaction.customId.split('_');
            const selectedCommandName = interaction.values[0];
            const allow = subcommand === 'add';

            try {
                await connectToDatabase();
                const db = getDb();
                const collection = db.collection('user_permissions');

                const selectedCommand = await interaction.guild.commands.fetch().then(commands => commands.find(cmd => cmd.name === selectedCommandName));
                console.log(selectedCommand);

                await collection.updateOne(
                    { userId: userId, command: selectedCommand.id },
                    { $set: { allowed: allow } },
                    { upsert: true }
                );
                await interaction.update({ content: strings.interactionCreate.subMenu.success(userId, allow), components: [] });
            } catch (error) {
                console.error(error);
                await interaction.update({ content: strings.interactionCreate.subMenu.error, components: [] });
            } finally {
                await closeDatabase();
            }
        }
    },
};