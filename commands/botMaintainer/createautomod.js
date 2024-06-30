const { SlashCommandBuilder, PermissionsBitField, AutoModerationRuleTriggerType, AutoModerationRuleEventType, AutoModerationActionType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createautomod')
        .setDescription('Cria um sistema de automoderação'),
    
    async execute(interaction) {
        const devServers = [
            '1256993570561196075',
            '1256993603532623934',
            '1256993648164212796',
            '',
        ];

        interaction.reply({ content: 'Criando regras de automoderação...', ephemeral: true });

        for (const guildId of devServers) {
            const guild = await interaction.client.guilds.fetch(guildId);

            if (guild) {
                try {
                    const existingRules = await guild.autoModerationRules.fetch();

                    const rulesToCreate = [
                        { name: 'Keyword Rule', eventType: AutoModerationRuleEventType.MessageSend, triggerType: AutoModerationRuleTriggerType.Keyword, triggerMetadata: { keywordFilter: ['badword1', 'badword2'] }, maxCount: 6 },
                        { name: 'Spam Rule', eventType: AutoModerationRuleEventType.MessageSend, triggerType: AutoModerationRuleTriggerType.Spam, triggerMetadata: {}, maxCount: 1 },
                        { name: 'Mention Rule', eventType: AutoModerationRuleEventType.MessageSend, triggerType: AutoModerationRuleTriggerType.KeywordPreset, triggerMetadata: { presets: [1] }, maxCount: 2 }
                    ];

                    for (const ruleConfig of rulesToCreate) {
                        const existingCount = existingRules.filter(rule => rule.triggerType === ruleConfig.triggerType).size;
                        const remaining = Math.min(9 - existingCount, ruleConfig.maxCount);

                        for (let i = 0; i < remaining; i++) {
                            await guild.autoModerationRules.create({
                                name: `${ruleConfig.name} ${i + 1}`,
                                eventType: ruleConfig.eventType,
                                triggerType: ruleConfig.triggerType,
                                triggerMetadata: ruleConfig.triggerMetadata,
                                actions: [{ type: AutoModerationActionType.BlockMessage }]
                            });
                            console.log(`AutoMod Rule ${ruleConfig.name} ${i + 1} created in guild ${guildId}`);
                        }
                    }
                } catch (error) {
                    console.error(`Failed to create AutoMod rule in guild ${guildId}:`, error);
                }
            } else {
                console.log(`Guild ${guildId} not found`);
            }
        }

        interaction.editReply({ content: 'Regras de automoderação criadas com sucesso!', ephemeral: true });
    }
};