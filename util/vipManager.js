module.exports = {
    vipSettings: {
        yeezyGang: {
            name: 'YeezyGang',
            id: '1248973408239226951',
            tier: 1,
        },
        rollsRoyce: {
            name: 'RollsRoyce',
            id: '1248973408239226951',
            tier: 1
        },
        ghostGang: {
            name: 'GhostGang',
            id: '1248973445753077791',
            tier: 2,
        },
        freestyle: {
            name: 'Freestyle',
            id: '1248973459883560970',
            tier: 3,
        },
        eightLife: {
            name: '8life',
            id: '1248973481987543083',
            tier: 3,
        },
        infamous: {
            name: 'infamous',
            id: '1248973502409736233',
            tier: 4,
        },
        holyFck: {
            name: 'holyFck',
            id: '1248973518897676374',
            tier: 4,
        },
        sexyStar: {
            name: 'sexyStar',
            id: '1248973532390490153',
            tier: null,
        },
    },
    tierSettings: {
        one: {
            parentChannel: '1249120298297589810',
        },
        two: {
            parentChannel: '1249120298297589810',
        },
        three: {
            parentChannel: '1249120298297589810',
        },
        four: {
            parentChannel: '1249120298297589810',
        },
    },
    getParentChannel: async function (vipName) {
        const { vipSettings, tierSettings } = this;
        console.log('DEBUG VIP NAME: ', vipName);
        const vip = vipSettings[vipName];
        if (!vip) {
            console.error(`No VIP settings found for name: ${vipName}`);
            return null;
        }
        console.log('DEBUG VIP SETTINGS: ', vip);
        switch (vip.tier) {
            case 1:
                return tierSettings.one.parentChannel;
            case 2:
                return tierSettings.two.parentChannel;
            case 3:
                return tierSettings.three.parentChannel;
            case 4:
                return tierSettings.four.parentChannel;
            default:
                console.error(`No tier setting found for tier: ${vip.tier}`);
                return null;
        }
    }
};