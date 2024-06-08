const { SlashCommandBuilder } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../../db');
const strings = require('../../util/strings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvip')
        .setDescription('Set VIP role for a member')
        .addUserOption(option => option.setName('membro').setDescription('Select the member').setRequired(true))
        .addStringOption(option => option.setName('type').setDescription('Select the VIP type').setRequired(true)
            .addChoices([
                { name: 'Yeezy Gang', value: '1248973408239226951' },
                { name: 'Rolls Royce', value: '1248973408239226951' },
                { name: 'Ghost Gang', value: '1248973445753077791' },
                { name: 'Free Style', value: '1248973459883560970' },
                { name: 'Eight Life', value: '1248973481987543083' },
                { name: 'Infamous', value: '1248973502409736233' },
                { name: 'Holy Fck', value: '1248973518897676374' },
                { name: 'Sexy Star', value: '1248973532390490153'}
            ])),
    async execute(interaction) {
        const user = interaction.options.getUser('membro');
        const type = interaction.options.getString('type');
        const guild = interaction.guild;
        const member = guild.members.cache.get(user.id);
        const role = guild.roles.cache.find(role => role.id === type);

        try {
            await connectToDatabase();
            const db = getDb();
            const permissionsCollection = db.collection('user_permissions');

            const permission = await permissionsCollection.findOne({ userId: interaction.user.id, command: 'setvip', allowed: true });

            if (!permission) {
                return await interaction.reply(strings.noPermission);
            }

            const vipsCollection = db.collection('VIPs');
            const vipData = {
                userID: user.id,
                type: type,
                purchaseDate: new Date(),
                expirationDate: new Date(),
                active: true,
                isVIPAdmin: false,
            };

            await vipsCollection.insertOne(vipData);
            await member.roles.add(role);
            await interaction.reply(strings.setvip.success(user.username, role.name));
        } catch (error) {
            console.error(strings.errorResponse, error);
            await interaction.reply(string.errorResponse);
        } finally {
            await closeDatabase();
        }
    },
};
