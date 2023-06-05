const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.DB_COLLECTION;

let isConnected = false;
let client = null;
let db = null;
let collection = null;

async function connect(uri, dbName) {
    if (isConnected) {
      console.log('Using existing database connection');
      return;
    }

    try {
      client = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, dbName });
      db = client.connection.db;
      collection = db.collection(collectionName);
      isConnected = true;
      console.log('Connected successfully to the database');
      return { client, db, collection };
    } catch (err) {
      console.error('Error connecting to the database:', err);
      throw err;
    }
  }

  function close() {
    if (isConnected) {
      mongoose.disconnect();
      isConnected = false;
      console.log('Connection to the database closed');
    }
  }

module.exports = { connect, close };

