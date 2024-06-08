const { SlashCommandBuilder } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../../db');
const strings = require('../../util/strings.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvip')
        .setDescription(strings.setvip.description)
        .addUserOption(option => option.setName('membro').setDescription(strings.setvip.options.member).setRequired(true))
        .addStringOption(option => option.setName('type').setDescription(strings.setvip.options.type).setRequired(true)
            .addChoices([
                { name: strings.setvip.vips.yeezyGang, value: '1248973408239226951' },
                { name: strings.setvip.vips.rollsRoyce, value: '1248973408239226951' },
                { name: strings.setvip.vips.ghostGang, value: '1248973445753077791' },
                { name: strings.setvip.vips.freeStyle, value: '1248973459883560970' },
                { name: strings.setvip.vips.eightLife, value: '1248973481987543083' },
                { name: strings.setvip.vips.infamous, value: '1248973502409736233' },
                { name: strings.setvip.vips.holyFck, value: '1248973518897676374' },
                { name: strings.setvip.vips.sexyStar, value: '1248973532390490153'}
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
                return await interaction.reply(this.strings.noPermission);
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
            await interaction.reply(`O usuário ${user.tag} foi definido como VIP com o tipo ${type}.`);
        } catch (error) {
            console.error('Erro ao executar o comando setvip:', error);
            await interaction.reply('Ocorreu um erro ao executar este comando.');
        } finally {
            await closeDatabase();
        }
    },
};
