const { Events } = require('discord.js');
const { connectToDatabase, getDb, closeDatabase } = require('../db');
const strings = require('../util/strings.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        const oldRoles = oldMember.roles.cache.map(role => role.id);
        const newRoles = newMember.roles.cache.map(role => role.id);
        const vipRoles = ['1248973408239226951', '1248973445753077791', '1248973459883560970', '1248973481987543083', '1248973502409736233', '1248973518897676374', '1248973532390490153'];
        const hasVipRole = vipRoles.some(role => newRoles.includes(role));

        if (hasVipRole) {
            try {
                await connectToDatabase();
                const db = getDb();
                const vipsCollection = db.collection('VIPs');
                const isVipMember = await vipsCollection.findOne({ userID: newMember.id, active: true });

                if (!isVipMember) {
                    const removedRole = vipRoles.find(role => newRoles.includes(role) && !oldRoles.includes(role));
                    if (removedRole) {
                        await newMember.roles.remove(removedRole);
                        console.log(strings.guildMemberUpdate.removedRole(newMember.user.tag, removedRole));
                    }
                }
            } catch (error) {
                console.error(strings.guildMemberUpdate.errorCheckingVipStatus, error);
            } finally {
                await closeDatabase();
            }
        }
    },
};
