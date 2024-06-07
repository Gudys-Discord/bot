const { SlashCommandBuilder, MessageActionRow, MessageSelectMenu, PermissionFlagsBits } = require('discord.js');
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
        .setDefaultUserPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const member = interaction.options.getUser('membro');
        const subcommand = interaction.options.getSubcommand();

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(`select_${subcommand}_${member.id}`)
                    .setPlaceholder('Nenhum comando selecionado')
                    .addOptions([
                        {
                            label: 'Set VIP',
                            description: 'Allow or disallow the user to use the setvip command',
                            value: 'setvip',
                        },
                    ]),
            );

        await interaction.reply({ content: `Selecione qual comando você quer ${subcommand === 'add' ? 'permitir' : 'proibir'} para ${member.username}`, components: [row] });
    },
};