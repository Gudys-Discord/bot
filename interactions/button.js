const { connectToDatabase, getDb, closeDatabase } = require('../db');
const strings = require('../util/strings.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const buttonID = interaction.customId;

        switch (buttonID) {
            case 'remove_vip':
                try {
                    const member = interaction.options?.get('membro')?.member;
                    console.log('Member:', member);
                    await connectToDatabase();
                    console.log('Connected to the database');
                    const db = getDb();
                    const vipsCollection = db.collection('VIPs');
                    const vip = await vipsCollection.findOne({ userID: member, active: true });

                    if (!vip) {
                        console.log('No VIP found');
                        await interaction.reply({ content: strings.setvip.noVip, ephemeral: true });
                        return;
                    }

                    await interaction.guild.roles.fetch();
                    console.log('Fetched guild roles');
                    const vipRole = interaction.guild.roles.cache.find(role => role.id === vip.type);
                    if (member && vipRole) {
                        await member.roles.remove(vipRole);
                        console.log('Removed VIP role from member');
                    }

                    await vipsCollection.deleteOne({ userID: member.id });
                    console.log('Deleted VIP from the database');
                    await interaction.reply({ content: strings.setvip.removeSuccess, ephemeral: true });
                } catch (error) {
                    console.error('Error:', error);
                    await interaction.reply({ content: strings.setvip.removeError, ephemeral: true });
                } finally {
                    await closeDatabase();
                    console.log('Closed the database connection');
                }
                break;
            case 'change_expiry':
                // Construindo o formulário
                const modal = new ModalBuilder()
                    .setTitle('Alterar data de expiração do VIP')
                    .setCustomId('vipChangeExpiry');
                console.log('Created modal:', modal);

                // Adicionando opções ao formulário
                const daysToAddInput = new TextInputBuilder()
                    .setCustomId('days_to_add')
                    .setLabel('Quantos dias você quer adicionar?')
                    .setRequired(true)
                    .setStyle(1);
                console.log('Created daysToAddInput:', daysToAddInput);

                const modalRow = new ActionRowBuilder().addComponents(daysToAddInput);
                console.log('Created modalRow:', modalRow);

                await modal.addComponents(modalRow);
                console.log('Added components to modal');
                await interaction.showModal(modal);
                console.log('Showing modal');
                break;
        }
    },
};