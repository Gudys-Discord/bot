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
        let targetUser = interaction.options.getUser('membro');
        if (!targetUser) targetUser = interaction.member;

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
            { name: 'Canal', value: vipDoc.vipChannel ? `<#${vipDoc.vipChannel}>` : 'Nenhum', inline: true },
            { name: 'Cargo VIP', value: vipDoc.vipRole ? `<@&${vipDoc.vipRole}>` : 'Nenhum', inline: true });
            if (vipDoc.isVIPAdmin) {
                vipEmbed.addFields( { name: 'VIP Admin', value: 'Sim', inline: true } );
            }

        return interaction.reply({ embeds: [vipEmbed] });
    },
};
