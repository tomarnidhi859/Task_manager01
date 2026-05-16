const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Bypass local DNS issues that cause ECONNREFUSED on SRV lookup
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
