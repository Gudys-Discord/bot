const { Events } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../db');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await connectToDatabase();
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            } finally {
                await closeDatabase();
            }
        } else if (interaction.isSelectMenu()) {
            const [action, userId] = interaction.customId.split('_');
            const selectedCommand = interaction.values[0];
            const allow = action === 'add';

            try {
                await connectToDatabase();
                const db = getDb();
                const collection = db.collection('user_permissions');

                await collection.updateOne(
                    { userId, command: selectedCommand },
                    { $set: { allowed: allow } },
                    { upsert: true }
                );
                await interaction.update({ content: `Permissão ${allow ? 'adicionada' : 'removida'} para o comando ${selectedCommand}.`, components: [] });
            } catch (error) {
                console.error(error);
                await interaction.update({ content: `Houve um erro ao atualizar as permissões.`, components: [] });
            } finally {
                await closeDatabase();
            }
        }
    },
};