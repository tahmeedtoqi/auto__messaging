const input = require('input');
const logger = require('./logger');

const getUserInput = {
  async getPhoneNumber() {
    logger.info('Requesting phone number from user...');
    let phone;
    while (true) {
      phone = await input.text('Please enter your phone number (international format, e.g., +1234567890): ');
      if (phone.match(/^\+[1-9]\d{1,14}$/)) {
        break;
      }
      logger.error('Invalid phone number format. Please use international format (e.g., +1234567890)');
    }
    logger.debug('Valid phone number received');
    return phone;
  },
  
  async getPassword() {
    logger.info('Requesting password...');
    const password = await input.password('Please enter your 2FA password (if enabled): ');
    logger.debug('Password received');
    return password;
  },
  
  async getCode() {
    logger.info('Requesting verification code...');
    const code = await input.text('Please enter the verification code sent to your Telegram: ');
    logger.debug('Verification code received');
    return code;
  }
};

module.exports = getUserInput;