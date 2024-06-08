const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../../db');
const strings = require('../../util/strings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvip')
        .setDescription(strings.setvip.description)
        .addUserOption(option => option.setName('membro').setDescription('Selecione o membro').setRequired(true))
        .addStringOption(option => option.setName('type').setDescription('Selecione o VIP').setRequired(true)
            .addChoices([
                { name: strings.setvip.vips.yeezyGang, value: '1248973408239226951' },
                { name: strings.setvip.vips.rollsRoyce, value: '1248973408239226951' },
                { name: strings.setvip.vips.ghostGang, value: '1248973445753077791' },
                { name: strings.setvip.vips.freestyle, value: '1248973459883560970' },
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
                await interaction.reply(strings.noPermission);
                return;
            }

            const vipsCollection = db.collection('VIPs');
            const existingVip = await vipsCollection.findOne({ userID: user.id, active: true});

            if (existingVip) {
                const VIProle = guild.roles.cache.find(role => role.id === existingVip.type);
                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('change_expiry')
                    .setLabel('Alterar Tempo de VIP')
                    .setStyle('Primary')
                    .setEmoji('⏰'),
                    new ButtonBuilder()
                    .setCustomId('remove_vip')
                    .setLabel('Remover VIP')
                    .setStyle('Secondary')
                    .setEmoji('🚫')
                )
                const embed = new EmbedBuilder()
                    .setColor(VIProle.color)
                    .setTitle(`VIP de ${user.username}`)
                    .setDescription(`O membro \`${user.username}\` já é um VIP.`)
                    .addFields(
                        { name: 'VIP', value: VIProle.name, inline: true },
                        { name: 'Termina em', value: `<t:${Math.floor(existingVip.expirationDate.getTime() / 1000)}:f>`, inline: true }
                    );
                await interaction.reply({ embeds: [embed], components: [row]});

                const filter = i => i.customId === 'remove_vip' || i.customId === 'change_expiry';
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

                collector.on('collect', async i => {
                    if (i.customId === 'remove_vip') {
                        await member.roles.remove(VIProle);
                        await vipsCollection.deleteOne({ userID: user.id });
                        const embed = new EmbedBuilder()
                            .setColor(VIProle.color)
                            .setTitle(`VIP de ${user.username}`)
                            .setDescription(strings.setvip.removeSuccess)
                            .setTimestamp();
                        await i.update({ embeds: [embed], components: [] });
                    } else if (i.customId === 'change_expiry') {
                        const modal = new ModalBuilder()
                            .setTitle('Alterar data de expiração do VIP')
                            .setCustomId('vipChangeExpiry');

                        const daysToAddInput = new TextInputBuilder()
                            .setCustomId('days_to_add')
                            .setLabel('Quantos dias você quer adicionar?')
                            .setRequired(true)
                            .setStyle(1);

                        const modalRow = new ActionRowBuilder().addComponents(daysToAddInput);

                        await i.update({ components: [modalRow], embeds: [], content: ' ' });
                        return;
                    }
                });
                return;
            }
            const vipData = {
                userID: user.id,
                type: type,
                purchaseDate: new Date(),
                expirationDate: new Date(),
                active: true,
                isVIPAdmin: false,
            };

            await vipsCollection.updateOne(vipData, { $set: vipData }, { upsert: true });
            await member.roles.add(role);
            const embed = new EmbedBuilder()
                .setColor(role.color)
                .setTitle(`VIP de ${user.username}`)
                .setDescription(strings.setvip.success(user.username, role.name))
                .addFields(
                    { name: 'VIP', value: role.name, inline: true},
                    { name: 'Termina em', value: `<t:${Math.floor(vipData.expirationDate.getTime() / 1000)}:f>`, inline: true}
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(strings.errorResponse, error);
            await interaction.reply(string.errorResponse);
        } finally {
            await closeDatabase();
        }
    },
};