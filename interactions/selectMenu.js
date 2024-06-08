const { connectToDatabase, getDb, closeDatabase } = require('../db');
const strings = require('../util/strings.js');

module.exports = {
    async execute(interaction) {
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
                await interaction.reply({ content: strings.permissions.hasPermissionAlready, ephemeral: true });
                return;
            }

            await collection.updateOne(
                { userId: userId, command: selectedCommand.name },
                { $set: { allowed: allow } },
                { upsert: true }
            );
            await interaction.update({ content: strings.permissions.success(userId, allow), components: [] });
        } catch (error) {
            console.error(error);
            await interaction.update({ content: strings.interactionCreate.subMenu.error, components: [] });
        } finally {
            await closeDatabase();
        }
    },
};