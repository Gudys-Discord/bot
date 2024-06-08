const { Events } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../db');
const strings = require('../util/strings.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
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
        } else if (interaction.isSelectMenu()) {
            const [prefix, subcommand, userId] = interaction.customId.split('_');
            const selectedCommandName = interaction.values[0];
            const allow = subcommand === 'add';

            if (prefix !== 'select') {
                console.error(`Unknown prefix: ${prefix}`);
                return;
            }

            try {
                await connectToDatabase();
                const db = getDb();
                const collection = db.collection('user_permissions');

                const commands = await interaction.guild.commands.fetch();
                const selectedCommand = commands.find(cmd => cmd.name === selectedCommandName);

                if (!selectedCommand) {
                    console.error(`No command found with the name: ${selectedCommandName}`);
                    return;
                }

                const existingPermission = await collection.findOne({ userId: userId, command: selectedCommand.name });

                if (existingPermission && existingPermission.allowed === allow) {
                    await interaction.reply({ content: `O membro <@${userId}> já tem permissão para usar esse comando`, ephemeral: true });
                    return;
                }

                await collection.updateOne(
                    { userId: userId, command: selectedCommand.name },
                    { $set: { allowed: allow } },
                    { upsert: true }
                );
                await interaction.update({ content: `O membro <@${userId}> agora ${allow ? 'pode' : 'não pode mais'} usar o comando </${selectedCommand.name}:${selectedCommand.id}>`, components: [] });
            } catch (error) {
                console.error(error);
                await interaction.update({ content: strings.interactionCreate.subMenu.error, components: [] });
            } finally {
                await closeDatabase();
            }
        }
    },
};