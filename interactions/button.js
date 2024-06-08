const { connectToDatabase, getDb, closeDatabase } = require('../db');
const strings = require('../util/strings.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const buttonID = interaction.customId;

        console.log('Button ID:', buttonID); // Debugging console log

        switch (buttonID) {
            case 'remove_vip':
                try {
                    const member = interaction.message.interaction.options.getUser('membro');
                    const type = interaction.message.interaction.options.getString('type');
                    await connectToDatabase();
                    const db = getDb();
                    const vipsCollection = db.collection('VIPs');
                    const vip = await vipsCollection.findOne({ userID: member, active: true });

                    console.log('Member:', member); // Debugging console log
                    console.log('Type:', type); // Debugging console log
                    console.log('VIP:', vip); // Debugging console log

                    if (!vip) {
                        await interaction.reply({ content: strings.setvip.noVip, ephemeral: true });
                        return;
                    }

                    await interaction.guild.roles.fetch();
                    const vipRole = interaction.guild.roles.cache.find(role => role.id === vip.type);
                    if (member && vipRole) {
                        await member.roles.remove(vipRole);
                    }

                    await vipsCollection.deleteOne({ userID: member.id });
                    await interaction.reply({ content: strings.setvip.removeSuccess, ephemeral: true });
                } catch (error) {
                    console.error('Error:', error); // Debugging console log
                    await interaction.reply({ content: strings.setvip.removeError, ephemeral: true });
                } finally {
                    await closeDatabase();
                }
                break;
            case 'change_expiry':
                const modal = new ModalBuilder()
                    .setTitle('Alterar data de expiração do VIP')
                    .setCustomId('vipChangeExpiry');

                const daysToAddInput = new TextInputBuilder()
                    .setCustomId('days_to_add')
                    .setLabel('Quantos dias você quer adicionar?')
                    .setRequired(true)
                    .setStyle(1);

                const modalRow = new ActionRowBuilder().addComponents(daysToAddInput);

                await modal.addComponents(modalRow);
                await interaction.showModal(modal);
                break;
        }
    },
};
