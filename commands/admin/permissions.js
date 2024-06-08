const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../util/strings.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('Gerenciar permissões de membros')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Permitir que um membro use um comando')
                .addUserOption(option => option.setName('membro').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remover a permissão de um membro para usar um comando')
                .addUserOption(option => option.setName('membro').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (interaction.member.guild.ownerId !== interaction.user.id) {
            return await interaction.reply({ content: strings.ownerOnly, ephemeral: true });
        }
        const member = interaction.options.getUser('membro');
        const subcommand = interaction.options.getSubcommand();

        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(`select_${subcommand}_${member.id}`)
                    .setPlaceholder(strings.permissions.menuPlaceholder)
                    .addOptions([
                        {
                            label: 'Set VIP',
                            description: 'Comando para adicionar VIPs',
                            value: 'setvip',
                        },
                    ]),
            );

        await interaction.reply({ content: strings.permissions.menu, components: [row] });
    },
};