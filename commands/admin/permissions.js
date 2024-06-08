const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('./interactionReplies');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription(strings.permissions.description)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription(strings.permissions.add)
                .addUserOption(option => option.setName('membro').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription(strings.permissions.remove)
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
                            description: strings.menuDescription,
                            value: 'setvip',
                        },
                    ]),
            );

        await interaction.reply({ content: strings.permissions.menu, components: [row] });
    },
};