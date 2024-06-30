const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { getDb } = require('../../db');
const vipManager = require('../../util/vipManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vip')
        .setDescription('Acesse o seu painel VIP!')
        .addUserOption(option =>
            option.setName('membro')
                .setDescription('Admin: O usuário para verificar o status VIP')
        ),

    async execute(interaction) {
        let targetUser = interaction.options.getUser('membro');
        if (!targetUser) targetUser = interaction.member.user;
        const db = await getDb();
        const VIPs = db.collection('VIPs');

        const vipDoc = await VIPs.findOne({ userID: targetUser.id });

        if (!vipDoc) {
            if (targetUser) {
                return interaction.reply(`O usuário ${targetUser.username} não é VIP.`);
            }
            return interaction.reply(`Você não é VIP, ${targetUser.username}.`);
        }

        const VIP = interaction.guild.roles.cache.find(role => role.id === vipDoc.type);
        const VIPColor = VIP ? VIP.color : null;

        const vipEmbed = new EmbedBuilder()
            .setColor(VIPColor ? VIPColor : 'RANDOM')
            .setTitle(`Painel VIP - ${targetUser.username}`)
            .addFields(
                { name: 'Termina em', value: vipDoc.isVIPAdmin ? `Nunca` : `<t:${Math.floor(vipDoc.expirationDate.getTime() / 1000)}:D>`, inline: true },
                { name: 'Nome do VIP', value: VIP.name, inline: true },
                { name: 'Ativo', value: vipDoc.active ? 'Sim' : 'Não', inline: true },
                { name: 'Canal', value: vipDoc.vipChannel ? `<#${vipDoc.vipChannel}>` : 'Nenhum', inline: true },
                { name: 'Cargo VIP', value: vipDoc.vipRole ? `<@&${vipDoc.vipRole}>` : 'Nenhum', inline: true });
        if (vipDoc.isVIPAdmin) {
            vipEmbed.addFields({ name: 'VIP Admin', value: 'Sim', inline: true });
        }

        const changeDurationButton = new ButtonBuilder()
            .setCustomId('changeDuration')
            .setLabel('Alterar duração')
            .setStyle(2)
            .setEmoji('⏰');

        const removeVIPButton = new ButtonBuilder()
            .setCustomId('removeVIP')
            .setLabel('Remover VIP')
            .setStyle(4)
            .setEmoji('🚫');

        const editChannelButton = new ButtonBuilder()
            .setCustomId(vipDoc.vipChannel ? 'editChannel' : 'createChannel')
            .setLabel(vipDoc.vipChannel ? 'Editar Canal' : 'Criar Canal')
            .setStyle(2);

        const editRoleButton = new ButtonBuilder()
            .setCustomId(vipDoc.vipRole ? 'editRole' : 'createRole')
            .setLabel(vipDoc.vipRole ? 'Editar cargo' : 'Criar cargo')
            .setStyle(2);

        const actionRow = new ActionRowBuilder();
        if (interaction.options.getUser('membro')) {
            actionRow.addComponents(changeDurationButton, removeVIPButton);
        } else if (targetUser) {
            actionRow.addComponents(editChannelButton, editRoleButton);
        }

        await interaction.reply({ embeds: [vipEmbed], components: [actionRow] });

        const collector = interaction.channel.createMessageComponentCollector({ time: 100000 });

        async function createOrUpdateChannel(interaction, vipDoc, targetUser, VIP, VIPs, newName = null) {
            let channel = interaction.guild.channels.cache.get(vipDoc.vipChannel);
            if (!channel) {
                channel = await interaction.guild.channels.create({
                    name: `VIP ${targetUser.username}`,
                    type: ChannelType.GuildVoice,
                    parent: await vipManager.getParentChannel(VIP.name),
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.Connect],
                        },
                        {
                            id: targetUser.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.Connect,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.MoveMembers,
                                PermissionsBitField.Flags.UseSoundboard,
                                PermissionsBitField.Flags.UseExternalSounds
                            ],
                        },
                        {
                            id: VIP.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.Connect,
                                PermissionsBitField.Flags.SendMessages,
                            ],
                        },
                    ],
                    reason: `Canal VIP criado para ${targetUser.username}`,
                });

                await VIPs.updateOne({ userID: targetUser.id }, { $set: { vipChannel: channel.id } });
                await interaction.update({ components: [actionRow] });
                await interaction.followUp({ content: `Canal VIP criado com sucesso!`, ephemeral: true });
                return;
            } else if (channel && newName) {
                const updatedName = newName.length > 25 ? newName.slice(0, 25) + "..." : newName;
                await channel.setName(updatedName);
                await interaction.followUp({ content: `O nome do teu canal VIP foi alterado para ${updatedName}`, ephemeral: true });
            }
        }

        async function createOrUpdateRole(interaction, vipDoc, targetUser, VIPs, newName = null) {
            let role = interaction.guild.roles.cache.get(vipDoc.vipRole);
            if (!role) {
                role = await interaction.guild.roles.create({
                    name: `VIP ${targetUser.username}`,
                    color: VIP.color,
                    permissions: [],
                    reason: `Cargo VIP criado para ${targetUser.username}`,
                });
                await interaction.member.roles.add(role);
                await VIPs.updateOne({ userID: targetUser.id }, { $set: { vipRole: role.id } });
                await interaction.reply({ content: `Cargo VIP criado com sucesso!`, ephemeral: true });
            } else if (newName) {
                const updatedName = newName.length > 15 ? newName.slice(0, 15) + "..." : newName;
                await role.setName(updatedName);
                await interaction.followUp({ content: `O nome do teu cargo VIP foi alterado para ${updatedName}`, ephemeral: true });
            }
        }

        async function changeDuration() {
            const addButton = new ButtonBuilder()
                .setCustomId('addDays')
                .setLabel('Adicionar dias')
                .setStyle(2);
            const removeButton = new ButtonBuilder()
                .setCustomId('removeDays')
                .setLabel('Remover dias')
                .setStyle(4);
            const actionRow = new ActionRowBuilder().addComponents(addButton, removeButton);
            await interaction.channel.send({ content: `Você quer adicionar ou remover dias?`, components: [actionRow], ephemeral: true });

            const collector = interaction.channel.createMessageComponentCollector({ time: 100000 });
            collector.once('collect', async i => {
                if (i.customId === 'addDays' || i.customId === 'removeDays') {
                    const isAdding = i.customId === 'addDays';
                    await i.update({ content: `Diga quantos dias você quer ${isAdding ? 'adicionar' : 'remover'} ao VIP`, components: [] });
                    const filter = m => m.author.id === interaction.user.id;
                    const messageCollector = interaction.channel.createMessageCollector({ filter, time: 15000 });
                    messageCollector.on('collect', async m => {
                        const days = parseInt(m.content);
                        if (isNaN(days)) {
                            await m.reply({ content: 'Por favor, digite um número válido.', ephemeral: true });
                        } else {
                            await VIPs.updateOne(
                                { userID: targetUser.id },
                                [{
                                    $set: {
                                        expirationDate: {
                                            $dateAdd: {
                                                startDate: "$expirationDate",
                                                unit: "day",
                                                amount: isAdding ? days : -days
                                            }
                                        }
                                    }
                                }]
                            );
                            await m.reply({ content: `Foram ${isAdding ? 'adicionados' : 'removidos'} ${days} dias ao VIP de <@${targetUser.id}>!`, ephemeral: true });
                        }
                        messageCollector.stop();
                    });
                }
            });
        }

        async function removeVIP(interaction, targetUser, VIPs, vipDoc) {
            await VIPs.deleteOne({ userID: targetUser.id });
            const channel = interaction.guild.channels.cache.get(vipDoc.vipChannel);
            const role = interaction.guild.roles.cache.get(vipDoc.vipRole);
            const vipRole = interaction.guild.roles.cache.get(vipDoc.type);
            if (interaction.member.roles.cache.has(vipDoc.vipRole)) {
                await vipRole.delete();
            }

            if (channel) {
                await channel.delete();
            }
            if (role) {
                await role.delete();
            }

            await interaction.followUp({ content: `O VIP de <@${targetUser.id}> foi removido com sucesso!`, ephemeral: true });
        }

        collector.on('collect', async i => {
            if (!i.isButton()) return;
            switch (i.customId) {
                case 'createChannel':
                    editChannelButton.setLabel('Editar Canal');
                    editChannelButton.setCustomId('editChannel');
                    await createOrUpdateChannel(i, vipDoc, targetUser, VIP, VIPs);
                    break;
                case 'editChannel':
                    await i.reply({ content: 'Diga o novo nome do teu canal VIP.', ephemeral: false });
                    const channelFilter = (message) => message.author.id === interaction.user.id;
                    const channelCollector = interaction.channel.createMessageCollector({ channelFilter, max: 1, time: 10000 });
                    channelCollector.once('collect', async m => {
                        await createOrUpdateChannel(i, vipDoc, targetUser, VIP, VIPs, m.content);
                        m.delete();
                    });
                    break;
                case 'createRole':
                    editRoleButton.setLabel('Editar Cargo');
                    editRoleButton.setCustomId('editRole');
                    await createOrUpdateRole(i, vipDoc, targetUser, VIPs);
                    break;
                case 'editRole':
                    await i.reply({ content: 'Diga o novo nome do teu cargo VIP.', ephemeral: false });
                    const roleFilter = (message) => message.author.id === interaction.user.id;
                    const roleCollector = interaction.channel.createMessageCollector({ roleFilter, max: 1, time: 10000 });
                    roleCollector.once('collect', async m => {
                        await createOrUpdateRole(i, vipDoc, targetUser, VIPs, m.content);
                        m.delete();
                    });
                    break;
                case 'changeDuration':
                    await i.deferUpdate();
                    await changeDuration();
                    break;
                case 'removeVIP':
                    await removeVIP(interaction, targetUser, VIPs, vipDoc);
                    break;
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    },
};