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

        function fibonacci(n, memo = {}) {
            if (memo[n]) return memo[n];
            if (n <= 1) return n;
            return memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
        }

        const result = fibonacci(index);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Fibonacci Sequence')
            .setDescription(`The Fibonacci number at index ${index} is:`);

        if (result.join(', ').length <= 2000) {
            embed.addFields({ name: 'Result', value: `\`\`\`${result.join(', ')}\`\`\`` });
            await interaction.reply({ embeds: [embed] });
        } else {
            const fileContent = result.join(', ');
            const file = new AttachmentBuilder(Buffer.from(fileContent, 'utf-8'), { name: `fibonacci_${length}.txt` });
            await interaction.reply({ files: [file] });
        }
    },
};
