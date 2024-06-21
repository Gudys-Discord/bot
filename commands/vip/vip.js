const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, TextInputBuilder, ModalBuilder, PermissionsBitField, ChannelType } = require('discord.js');
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
        if (!interaction.member.permissions.has('ADMINISTRATOR') && targetUser) {
            return interaction.reply({ content: 'Você não tem permissão para ver o painel VIP de outros membros.', ephemeral: true });
        }
        let targetUser = interaction.options.getUser('membro');
        if (!targetUser) targetUser = interaction.member.user
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

        async function createChannel(interaction, vipDoc, targetUser, VIP, VIPs) {
            if (!vipDoc.vipChannel) {
                const newChannel = await interaction.guild.channels.create({
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

                await VIPs.updateOne({ userID: targetUser.id }, { $set: { vipChannel: newChannel.id } });
                await interaction.reply({ content: `Canal VIP criado com sucesso!`, ephemeral: true });
            } else if (interaction.customId === 'editChannel') {
                await interaction.reply({ content: 'Diga o novo nome do teu canal VIP', ephemeral: false });

                const filter = m.author.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

                collector.on('collect', async m => {
                    const channel = interaction.guild.channels.cache.get(vipDoc.vipChannel);
                    await channel.setName(m.content);
                    await m.reply(`O nome do seu canal VIP foi alterado para ${m.content}`);
                    m.delete();
                });
            }
        }

        async function createRole(interaction, vipDoc, VIPs) {
            if (!vipDoc.vipRole) {
                const newRole = await interaction.guild.roles.create({
                    name: `VIP ${targetUser.username}`,
                    color: VIPColor,
                    permissions: [],
                    reason: `Cargo VIP criado para ${targetUser.username}`,
                });
                const role = interaction.guild.roles.cache.get(newRole.id);
                await interaction.member.roles.add(role);
                await interaction.reply({ content: `Cargo VIP criado com sucesso!`, ephemeral: true });
                await VIPs.updateOne({ userID: targetUser.id }, { $set: { vipRole: newRole.id } });
            } else if (interaction.customId === 'editRole') {
                await interaction.reply({ content: 'Diga o novo nome do teu cargo VIP.', ephemeral: false });

                const filter = m.author.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

                collector.on('collect', async m => {
                    const role = interaction.guild.roles.cache.get(vipDoc.vipRole);
                    await role.setName(m.content);
                    await m.reply(`O nome do seu cargo VIP foi alterado para ${m.content}`);
                    m.delete();
                });
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
            collector.on('collect', async i => {
                if (i.customId === 'addDays') {
                    await i.update({ content: `Diga quantos dias você quer adicionar ao VIP`, components: [] });
                    const filter = m => m.author.id === interaction.user.id;
                    const messageCollector = interaction.channel.createMessageCollector({ filter, time: 15000 });
                    messageCollector.on('collect', async m => {
                        const days = parseInt(m.content);
                        if (!isNaN(days)) {
                            await m.reply({ content: 'Por favor, digite um número válido.', ephemeral: true });
                        } else {
                            await VIPs.updateOne({ userID: targetUser.id }, { $inc: { expirationDate: days * 86400000 } });
                            await m.reply({ content: `Foram adicionados ${days} dias ao VIP de <@${targetUser.id}>!`, ephemeral: true });
                        }
                        messageCollector.stop();
                    });
                } else if (i.customId === 'removeDays') {
                    await i.update({ content: `Diga quantos dias você quer remover do VIP`, components: [] });
                    const filter = m => m.author.id === interaction.user.id;
                    const messageCollector = interaction.channel.createMessageCollector({ filter, time: 15000 });
                    messageCollector.on('collect', async m => {
                        const days = parseInt(m.content);
                        if (!isNaN(days)) {
                            await m.reply({ content: 'Por favor, digite um número válido.', ephemeral: true });
                        } else {
                            await VIPs.updateOne({ userID: targetUser.id }, { $inc: { expirationDate: -days * 86400000 } });
                            await m.reply({ content: `Foram removidos ${days} dias do VIP de <@${targetUser.id}>!`, ephemeral: true });
                        }
                        messageCollector.stop();
                    });
                }
            });
        }


        collector.on('collect', async i => {
            if (!i.isButton()) return;
            switch (i.customId) {
                case 'createChannel':
                    await createChannel(i, vipDoc, targetUser, VIP, VIPs);
                    break;
                case 'editChannel':
                    await createChannel(i, vipDoc, targetUser, VIP, VIPs);
                case 'createRole':
                    await createRole(i, vipDoc, VIPs);
                    break;
                case 'editRole':
                    await createRole(i, vipDoc, VIPs);
                    break;
                case 'changeDuration':
                    await changeDuration();
                    break;
                case 'removeVIP':
                    await removeVIP();
                    break;
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });

        const textInputCollector = interaction.channel.createMessageComponentCollector({ time: 15000 });

        textInputCollector.on('collect', async i => {
            if (i.customId === 'newChannelName') {
                const newChannelName = i.values[0];
                const channel = interaction.guild.channels.cache.get(vipDoc.vipChannel);
                await channel.setName(newChannelName);
                await i.update({ content: `O nome do canal foi alterado para ${newChannelName}` });
            } else if (i.customId === 'newRoleName') {
                const newRoleName = i.values[0];
                const role = interaction.guild.roles.cache.get(vipDoc.vipRole);
                await role.setName(newRoleName);
                await i.update({ content: `O nome do cargo foi alterado para ${newRoleName}` });
            }
        });
    },
};
