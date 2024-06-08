const { SlashCommandBuilder, MessageEmbed, MessageAttachment } = require('discord.js');
const colors = require('colors');
const fs = require('fs');
const util = require('util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('JavaScriptコードを実行します。')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('実行するコード')
                .setRequired(true)),
    async execute(interaction) {
        colors.enable();
        console.log(`Eval: `.yellow + `ユーザーがコマンドを実行しました: ${interaction.user.username}`);

        if (interaction.user.id !== '440442804360052736') {
            return await interaction.reply({ content: '申し訳ありませんが、このコマンドを使用する権限がありません。', ephemeral: true });
        }

        const input = interaction.options.getString('input');
        try {
            let output = eval(input);

            if(typeof output !== 'string') {
                output = util.inspect(output, { depth: 0 });
            }

            if (output instanceof Promise) {
                output = await output;
            }

            if (output.length > 2000) {
                fs.writeFileSync('output.txt', output);
                const attachment = new MessageAttachment('output.txt');
                await interaction.reply({ files: [attachment] });
            } else {
                const embed = new MessageEmbed()
                    .setTitle(`出力`)
                    .setDescription(`\`\`\`js\n${output}\n\`\`\``)
                    .setColor('#0099ff');
                await interaction.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
        }
    },
};