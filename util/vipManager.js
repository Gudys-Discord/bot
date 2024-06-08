module.exports = {
    YeezyGang: {
        parentChannel: '1249120298297589810'
    },
    RollsRoyce: {
        parentChannel: '1249120298297589810'
    },
    GhostGang: {
        parentChannel: '1249120298297589810'
    },
    Freestyle: {
        parentChannel: '1249120298297589810'
    },
    eightLife: {
        parentChannel: '1249120298297589810'
    },
    Infamous: {
        parentChannel: '1249120298297589810'
    },
    HolyFck: {
        parentChannel: '1249120298297589810'
    },
    SexyStar: {
        parentChannel: '1249120298297589810'
    },
    getParentChannel: function(vipType) {
        if(vipType === '8life') vipType = 'eightLife';
        return this[vipType].parentChannel;
    }
};