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
            name: 'Infamous',
            id: '1248973502409736233',
            tier: 4,
        },
        holyFck: {
            name: 'HolyFck',
            id: '1248973518897676374',
            tier: 4,
        },
        sexyStar: {
            name: 'SexyStar',
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
        if (vipSettings[vipName].tier === 1) {
            return tierSettings.one.parentChannel;
        } else if (vipSettings[vipName].tier === 2) {
            return tierSettings.two.parentChannel;
        } else if (vipSettings[vipName].tier === 3) {
            return tierSettings.three.parentChannel;
        } else if (vipSettings[vipName].tier === 4) {
            return tierSettings.four.parentChannel;
        }
    }
}