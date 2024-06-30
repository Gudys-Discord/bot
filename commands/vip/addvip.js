const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const strings = require('../../util/strings.js');
const { getDb } = require('../../db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addvip')
		.setDescription('Adiciona o seu cargo vip em outro membro!')
        .addUserOption(option => option.setName('membro').setDescription('O membro pra quem você quer dar o seu cargo VIP!').setRequired(true)),
	async execute(interaction) {
        const member = interaction.options.getMember('membro');
        const db = await getDb();
        const VIPs = db.collection('VIPs');
        const vipDoc = await VIPs.findOne({ userID: targetUser.id });

        console.log(vipDoc);
        interaction.reply(`Resultado enviado ao console.`);
	},
};