const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let db;

async function connectToDatabase() {
    if (!client.isConnected) {
        await client.connect();
    }
    db = client.db('discord');
    console.log('Connected to MongoDB');
}

function getDb() {
    if (!db) {
        throw new Error('Database not connected. Please call connectToDatabase first.');
    }
    return db;
}

async function closeDatabase() {
    if (client.isConnected) {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

module.exports = {
    connectToDatabase,
    getDb,
    closeDatabase,
};