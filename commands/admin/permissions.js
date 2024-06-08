const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('Gerenciar permissões de membros')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Permitir que um membro use um comando')
                .addUserOption(option => option.setName('membro').setDescription('O membro que você quer permitir usar um comando.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remover a permissão de um membro para usar um comando')
                .addUserOption(option => option.setName('membro').setDescription('O membro que você quer proibir de usar um comando.').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (interaction.member.guild.ownerId !== interaction.user.id) {
            return await interaction.reply({ content: 'This command is owner only.', ephemeral: true });
        }
        const member = interaction.options.getUser('membro');
        const subcommand = interaction.options.getSubcommand();
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(`select_${subcommand}_${member.id}`)
                    .setPlaceholder('Select an option')
                    .addOptions([
                        {
                            label: 'Set VIP',
                            description: 'Comando para adicionar VIPs',
                            value: 'setvip',
                        },
                    ]),
            );

        await interaction.reply({ content: `Escolha o comando que você quer ${subcommand === 'add' ? 'permitir' : 'proibir'}.`, components: [row] });
    },
};