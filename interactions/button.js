const { connectToDatabase, getDb, closeDatabase } = require('../db');
const strings = require('../util/strings.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const buttonID = interaction.customId;

        switch (buttonID) {
            case 'remove_vip':
                try {
                    await connectToDatabase();
                    const db = getDb();
                    const vipsCollection = db.collection('VIPs');
                    const vip = await vipsCollection.findOne({ userID: interaction.values[0], active: true });

                    if (!vip) {
                        await interaction.reply({ content: strings.setvip.noVip, ephemeral: true });
                        return;
                    }

                    const member = interaction.options.get('membro').member;
                    await interaction.guild.roles.fetch();
                    const vipRole = interaction.guild.roles.cache.find(role => role.id === vip.type);
                    if (member && vipRole) {
                        await member.roles.remove(vipRole);
                    }

                    await vipsCollection.deleteOne({ userID: interaction.values[0] });
                    await interaction.reply({ content: strings.setvip.removeSuccess, ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: strings.setvip.removeError, ephemeral: true });
                } finally {
                    await closeDatabase();
                }
                break;
            case 'change_expiry':
                // Construindo o formulário
                const modal = new ModalBuilder()
                    .setTitle('Alterar data de expiração do VIP')
                    .setCustomId('vipChangeExpiry')

                // Adicionando opções ao formulário
                const daysToAddInput = new TextInputBuilder()
                    .setCustomId('days_to_add')
                    .setLabel('Quantos dias você quer adicionar?')
                    .setRequired(true)
                    .setStyle(1)

                const modalRow = new ActionRowBuilder().addComponents(daysToAddInput);

                await modal.addComponents(modalRow);
                await interaction.showModal(modal);
                break;
        }
    },
};