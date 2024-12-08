require('dotenv').config();
const validateConfig = require('./validation');
const logger = require('../utils/logger');

try {
  validateConfig();
} catch (error) {
  logger.error('Configuration Error:', error.message);
  process.exit(1);
}

// Ensure API_ID is properly converted to number
const apiId = parseInt(process.env.API_ID, 10);

module.exports = {
  botToken: process.env.BOT_TOKEN,
  apiId: apiId, // Now guaranteed to be a number
  apiHash: process.env.API_HASH
};