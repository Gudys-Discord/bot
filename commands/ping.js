const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with latency'),
	async execute(interaction) {
		await interaction.reply({ content: 'Pinging...' });
		await interaction.editReply(`Pong! Latency is ${interaction.createdTimestamp - Date.now()}ms.`);
	},
};
