const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('Manage command permissions for specific members')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Allow a member to use a command')
                .addUserOption(option => option.setName('membro').setDescription('The member').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Disallow a member from using a command')
                .addUserOption(option => option.setName('membro').setDescription('The member').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (interaction.member.guild.ownerId !== interaction.user.id) {
            return await interaction.reply({ content: 'Apenas o dono do servidor pode executar este comando.', ephemeral: true });
        }
        const member = interaction.options.getUser('membro');
        const subcommand = interaction.options.getSubcommand();

        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(`select_${subcommand}_${member.id}`)
                    .setPlaceholder('Nenhum comando selecionado')
                    .addOptions([
                        {
                            label: 'Set VIP',
                            description: 'Comando para definir um membro como VIP',
                            value: 'setvip',
                        },
                    ]),
            );

        await interaction.reply({ content: `Selecione qual comando você quer ${subcommand === 'add' ? 'permitir' : 'proibir'} para ${member.username}`, components: [row] });
    },
};