function validateConfig() {
  const requiredEnvVars = ['BOT_TOKEN', 'API_ID', 'API_HASH'];
  const missing = requiredEnvVars.filter(key => !process.env[key] || process.env[key] === 'your_' + key.toLowerCase());
  
  if (missing.length > 0) {
    throw new Error(
      `Missing or invalid environment variables: ${missing.join(', ')}\n` +
      'Please create a .env file based on .env.example and fill in your Telegram credentials.'
    );
  }

  // Validate API_ID is a number
  if (isNaN(process.env.API_ID)) {
    throw new Error('API_ID must be a number');
  }
}

module.exports = validateConfig;