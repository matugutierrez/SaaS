const dotenv = require('dotenv');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
}

module.exports = {
  PORT: process.env.PORT || 10000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
