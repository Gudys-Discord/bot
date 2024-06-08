const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, TextInputBuilder, ModalBuilder } = require('discord.js');
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
        if (!targetUser) targetUser = interaction.member.user

        const db = await getDb();
        const VIPs = db.collection('VIPs');

        const vipDoc = await VIPs.findOne({ userID: targetUser.id });

        if (!vipDoc) {
            return interaction.reply(`Você não é VIP, ${targetUser.username}.`);
        }

        const VIP = interaction.guild.roles.cache.find(role => role.id === vipDoc.type).name;

        const vipEmbed = new EmbedBuilder()
            .setColor(VIP.color)
            .setTitle(`Painel VIP - ${targetUser.username}`)
            .addFields(
                { name: 'Termina em', value: `<t:${Math.floor(vipDoc.expirationDate.getTime() / 1000)}:D>`, inline: true },
                { name: 'Nome do VIP', value: VIP, inline: true },
                { name: 'Ativo', value: vipDoc.active ? 'Sim' : 'Não', inline: true },
                { name: 'Canal', value: vipDoc.vipChannel ? `<#${vipDoc.vipChannel}>` : 'Nenhum', inline: true },
                { name: 'Cargo VIP', value: vipDoc.vipRole ? `<@&${vipDoc.vipRole}>` : 'Nenhum', inline: true });
        if (vipDoc.isVIPAdmin) {
            vipEmbed.addFields({ name: 'VIP Admin', value: 'Sim', inline: true });
        }

        const editChannelButton = new ButtonBuilder()
            .setCustomId('editChannel')
            .setLabel('Editar Canal')
            .setStyle('SECONDARY');

        const editRoleButton = new ButtonBuilder()
            .setCustomId('editRole')
            .setLabel('Editar cargo')
            .setStyle('SECONDARY');

        const actionRow = new ActionRowBuilder()
            .addComponents(editChannelButton, editRoleButton);

        await interaction.reply({ embeds: [vipEmbed], components: [actionRow] });

        const collector = interaction.channel.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', async i => {
            if (!i.isButton()) return;
            if (i.customId === 'editChannel') {
                if (!vipDoc.vipChannel) {
                    const newChannel = await interaction.guild.channels.create('VIP Channel', { type: 'GUILD_VOICE' });
                    await VIPs.updateOne({ userID: targetUser.id }, { $set: { vipChannel: newChannel.id } });
                    await i.update({ content: 'O seu canal não existia, criei ele para você agora. Você deseja editar o nome dele?' });
                } else {
                    const modal = new ModalBuilder()
                        .setTitle('Editar Canal')
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('newChannelName')
                                .setLabel('Qual o novo nome do canal?')
                                .setPlaceholder('Deixe em branco para pular.')
                        );
                    await i.reply({ content: 'Alteração guardada com sucesso.', components: [modal] });
                }
            } else if (i.customId === 'editRole') {
                if (!vipDoc.vipRole) {
                    const newRole = await interaction.guild.roles.create({ name: `VIP de ${targetUser.username}` });
                    await VIPs.updateOne({ userID: targetUser.id }, { $set: { vipRole: newRole.id } });
                    await i.update({ content: 'O seu cargo não existia, criei ele para você agora. Você deseja editar o nome dele?' });
                } else {
                    const modal = new ModalBuilder()
                        .setTitle('Editar cargo')
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('newRoleName')
                                .setLabel('Qual o novo nome do cargo?')
                                .setPlaceholder('Deixe em branco para pular.')
                        );
                    await i.reply({ content: 'Alteração guardada com sucesso.', components: [modal] });
                }
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    },
};
