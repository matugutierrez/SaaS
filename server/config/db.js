const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let gridfsBucket = null;

async function connectDB() {
  const conn = await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected:', conn.connection.host);

  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
    bucketName: 'uploads',
  });

  return conn;
}

function getGridFSBucket() {
  return gridfsBucket;
}

module.exports = { connectDB, getGridFSBucket };
