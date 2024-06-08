const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { getDb } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vipstatus')
        .setDescription('Verifica o status VIP de um usuário, ou o seu próprio status VIP.')
        .addUserOption(option =>
            option.setName('membro')
                .setDescription('O usuário para verificar o status VIP')
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('membro');

        const db = await getDb();
        const VIPs = db.collection('VIPs');

        const vipDoc = await VIPs.findOne({ userID: targetUser.id });

        if (!vipDoc) {
            return interaction.reply(`Você não é VIP, ${targetUser.username}.`);
        }

        const VIP = interaction.guild.roles.cache.find(role => role.id === vipDoc.type).name;

        const vipEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Painel VIP - ${targetUser.username}`)
            .addFields(
            { name: 'Termina em', value: `<t:${Math.floor(vipDoc.expirationDate.getTime() / 1000)}:D>`, inline: true },
            { name: 'Tipo', value: VIP, inline: true },
            { name: 'Ativo', value: vipDoc.active ? 'Sim' : 'Não', inline: true },
            );
            if (vipDoc.isVIPAdmin) {
                vipEmbed.addField('É VIP Admin', 'Sim', true);
            }

        return interaction.reply({ embeds: [vipEmbed] });
    },
};
