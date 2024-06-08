const { connectToDatabase, getDb, closeDatabase } = require('../db');
const strings = require('../util/strings.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const daysToAdd = parseInt(interaction.values[0]);
        if (isNaN(daysToAdd)) {
            await interaction.reply({ content: strings.setvip.invalidDays, ephemeral: true });
            return;
        }

        try {
            await connectToDatabase();
            const db = getDb();
            const vipsCollection = db.collection('VIPs');
            const vip = await vipsCollection.findOne({ userID: interaction.user.id, active: true });

            if (!vip) {
                await interaction.reply({ content: strings.setvip.noVip, ephemeral: true });
                return;
            }

            const newExpirationDate = new Date(vip.expirationDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
            await vipsCollection.updateOne(
                { userID: interaction.user.id },
                { $set: { expirationDate: newExpirationDate } }
            );
            await interaction.reply({ content: strings.setvip.changeExpirySuccess, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: strings.setvip.changeExpiryError, ephemeral: true });
        } finally {
            await closeDatabase();
        }
    },
};