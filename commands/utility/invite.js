const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../util/strings.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Sends the bot invite link in the chat!')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		interaction.reply(strings.inviteResponse);
	},
};