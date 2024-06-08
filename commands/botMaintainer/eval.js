const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const colors = require('colors');

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
                output = require('util').inspect(output, { depth: 0 });
            }

            if (output instanceof Promise) {
                output = await output;
            }

            if (typeof output !== 'string') {
            }

            const maxMessageLength = 5999;
            let currentLength = 0;
            let messageEmbeds = [];

            const maxEmbedDescriptionLength = 4095;
            const outputChunks = output.match(new RegExp('.{1,' + maxEmbedDescriptionLength + '}', 'g'));

            const embeds = outputChunks.map((chunk, index) => {
                return new EmbedBuilder()
                    .setTitle(`出力`)
                    .setDescription(`\`\`\`js\n${chunk}\n\`\`\``)
                    .setColor('#0099ff');
            });

            for (const embed of embeds) {
                const embedLength = JSON.stringify(embed.toJSON()).length;
                if (currentLength + embedLength > maxMessageLength) {
                    await interaction.reply({ embeds: messageEmbeds });
                    messageEmbeds = [];
                    currentLength = 0;
                }
                messageEmbeds.push(embed);
                currentLength += embedLength;
            }

            if (messageEmbeds.length) {
                await interaction.reply({ embeds: messageEmbeds });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
        }
    },
};
