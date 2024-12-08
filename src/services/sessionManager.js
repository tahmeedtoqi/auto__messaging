const { StringSession } = require('telegram/sessions');
const { TelegramClient } = require('telegram');
const getUserInput = require('../utils/input');
const logger = require('../utils/logger');

class SessionManager {
  constructor(apiId, apiHash) {
    if (!apiId || !apiHash) {
      throw new Error('API credentials are required');
    }
    
    // Ensure apiId is a number and valid
    this.apiId = Number(apiId);
    
    if (isNaN(this.apiId) || !Number.isInteger(this.apiId) || this.apiId <= 0) {
      throw new Error('API_ID must be a valid positive integer');
    }
    
    this.apiHash = apiHash;
    this.sessions = new Map();
    logger.info('Session manager initialized');
  }

  async createSession(userId) {
    try {
      logger.info(`Creating new session for user ${userId}`);
      const stringSession = new StringSession('');
      
      // Ensure apiId is passed as a number
      const client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
        connectionRetries: 5,
        useWSS: true,
        timeout: 30000,
        deviceModel: 'Desktop',
        systemVersion: 'Windows 10',
        appVersion: '1.0.0'
      });
      
      logger.info('Starting client authentication...');
      await client.start({
        phoneNumber: async () => {
          const phone = await getUserInput.getPhoneNumber();
          // Validate phone number format
          if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
            throw new Error('Invalid phone number format. Please use international format (e.g., +1234567890)');
          }
          return phone;
        },
        password: getUserInput.getPassword,
        phoneCode: getUserInput.getCode,
        onError: (err) => logger.error('Client error:', err),
      });
      
      this.sessions.set(userId, {
        session: client.session.save(),
        client: client
      });
      
      logger.info(`Session created successfully for user ${userId}`);
      return client;
    } catch (error) {
      logger.error(`Session creation error for user ${userId}:`, error);
      throw error;
    }
  }

  async getSession(userId) {
    const session = this.sessions.get(userId);
    if (!session) {
      logger.debug(`No session found for user ${userId}`);
    }
    return session;
  }

  async closeSession(userId) {
    const session = await this.getSession(userId);
    if (session?.client) {
      logger.info(`Closing session for user ${userId}`);
      await session.client.disconnect();
      this.sessions.delete(userId);
      logger.info(`Session closed for user ${userId}`);
    }
  }
}

module.exports = SessionManager;