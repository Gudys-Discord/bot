const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongoUri } = require('./config.json');

const client = new MongoClient(mongoUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connect() {
    try {
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
            console.log("Connected to MongoDB");
        }
        const db = client.db('discord');
        const collection = db.collection('VIPs');
        const vipData = {
            userID: 'exampleUserID',
            roleID: 'exampleRoleID',
            purchaseDate: new Date(),
            expirationDate: new Date(),
            active: true,
            isVIPAdmin: false
        };
        const existingData = await collection.findOne({});
        if (!existingData) {
            await collection.insertOne(vipData);
            console.log("VIPs collection initialized for the first time.");
        } else {
            console.log("VIPs ready");
        }
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

module.exports = { connect };