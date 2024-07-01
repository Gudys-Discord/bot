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
        const message = await interaction.channel.send({ content: 'Calculating...' });

        function fibonacci(n, memo = {}) {
            if (memo[n]) return memo[n];
            if (n <= 1) return BigInt(n);
            return memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
        }

        const result = fibonacci(index).toString();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Fibonacci Number')
            .setDescription(`The Fibonacci number at index ${index} is:`);

        if (result.length <= 2000) {
            embed.addFields({ name: 'Result', value: `\`\`\`${result}\`\`\`` });
            await message.delete();
            await interaction.reply({ embeds: [embed] });
        } else {
            const fileContent = result;
            const file = new AttachmentBuilder(Buffer.from(fileContent, 'utf-8'), { name: `fibonacci_${index}.txt` });
            await message.delete();
            await interaction.reply({ content: 'Result too long, sending as file...', files: [file] });
        }
    },
};
