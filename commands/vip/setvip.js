const { SlashCommandBuilder } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvip')
        .setDescription(this.strings.setvip.description)
        .addUserOption(option => option.setName('membro').setDescription(this.strings.setvip.options.member).setRequired(true))
        .addStringOption(option => option.setName('type').setDescription(this.strings.setvip.options.type).setRequired(true)
            .addChoices([
                { name: this.strings.setvip.vips.yeezy, value: '1' },
                { name: this.strings.setvip.vips.rollsRoyce, value: '2' },
                { name: this.strings.setvip.vips.ghostGang, value: '3' },
                { name: this.strings.setvip.vips.freeStyle, value: '4' },
                { name: this.strings.setvip.vips.eightLife, value: '5' },
                { name: this.strings.setvip.vips.infamous, value: '6' },
                { name: this.strings.setvip.vips.holyFck, value: '7' },
                { name: this.strings.setvip.vips.sexyStar, value: '8'}
            ])),
    async execute(interaction) {
        const user = interaction.options.getUser('membro');
        const type = interaction.options.getString('type');

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
            await interaction.reply(`O usuário ${user.tag} foi definido como VIP com o tipo ${type}.`);
        } catch (error) {
            console.error('Erro ao executar o comando setvip:', error);
            await interaction.reply('Ocorreu um erro ao executar este comando.');
        } finally {
            await closeDatabase();
        }
    },
};