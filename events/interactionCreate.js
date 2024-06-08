const { Events } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../db');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        /*
        * COMMAND HANDLER
        */
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
                await interaction.update({ content: selectedCommand.id ? `O membro <@${userId}> ${allow ? 'agora pode usar' : 'não pode mais usar'} o comando com ID </${selectedCommand.name}:${selectedCommand.id}>.` : 'Permissão atualizada.', components: [] });
            } catch (error) {
                console.error(error);
                await interaction.update({ content: `Houve um erro ao atualizar as permissões.`, components: [] });
            } finally {
                await closeDatabase();
            }
        }
    },
};