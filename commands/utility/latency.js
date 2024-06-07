const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('latency')
		.setDescription('Replies with latency'),
	async execute(interaction) {
		const ping = Date.now() - interaction.createdTimestamp;
		interaction.reply({ content: `Pong! Latency: ${ping}ms` });
	},
};