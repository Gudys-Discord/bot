const { SlashCommandBuilder, PermissionsBitField, AutoModerationRuleTriggerType, AutoModerationRuleEventType, AutoModerationActionType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createautomod')
        .setDescription('Cria um sistema de automoderação'),

    async execute(interaction) {
        const devServers = [
            '1256971261310013471', '1256971183514062899',
            '1256971018267005010', '737173603107340310',
            '1240514457298276402', '1240720918314221679',
            '1240720983908683828', '1240720956461158533',
            '1240721047347789884', '1240721072890970275'
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