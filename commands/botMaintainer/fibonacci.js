const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fibonacci')
        .setDescription('Generates the first n numbers in the Fibonacci sequence.')
        .addIntegerOption(option =>
            option.setName('index')
                .setDescription('The number of Fibonacci numbers to generate.')
                .setRequired(true)),

    async execute(interaction) {
        const index = interaction.options.getInteger('index');

        function fibonacci(n) {
            let a = BigInt(0), b = BigInt(1), temp;
            for (let i = 0; i < n; i++) {
                temp = a;
                a = b;
                b = temp + b;
            }
            return a;
        }

        const result = fibonacci(index).toString();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Fibonacci Number')
            .setDescription(`The Fibonacci number at index ${index} is:`);

        if (result.length <= 2000) {
            embed.addFields({ name: 'Result', value: `\`\`\`${result}\`\`\`` });
            await interaction.editReply({ embeds: [embed] });
        } else {
            const fileContent = result;
            const file = new AttachmentBuilder(Buffer.from(fileContent, 'utf-8'), { name: `fibonacci_${index}.txt` });
            await interaction.editReply({ content: 'Result too long, sending as file...', files: [file] });
        }
    },
};
