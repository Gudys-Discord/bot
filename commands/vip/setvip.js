const { SlashCommandBuilder } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvip')
        .setDescription('Definir um membro como VIP')
        .addUserOption(option => option.setName('membro').setDescription('O membro a ser definido como VIP').setRequired(true))
        .addStringOption(option => option.setName('type').setDescription('O VIP a ser atribuído').setRequired(true)
            .addChoice('VIP 1', '1')
            .addChoice('VIP 2', '2')
            .addChoice('VIP 3', '3')
            .addChoice('VIP 4', '4')
            .addChoice('VIP 5', '5')
            .addChoice('VIP 6', '6')
            .addChoice('VIP 7', '7')),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const type = interaction.options.getString('type');

        try {
            await connectToDatabase();
            const db = getDb();
            const permissionsCollection = db.collection('user_permissions');

            const permission = await permissionsCollection.findOne({ userId: interaction.user.id, command: 'setvip', allowed: true });

            if (!permission) {
                return await interaction.reply('Você não tem permissão para usar este comando.');
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