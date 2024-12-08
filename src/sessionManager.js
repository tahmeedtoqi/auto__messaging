const { StringSession } = require('telegram/sessions');
const { TelegramClient } = require('telegram');
const getUserInput = require('./utils/input');

class SessionManager {
  constructor(apiId, apiHash) {
    this.apiId = apiId;
    this.apiHash = apiHash;
    this.sessions = new Map();
  }

  async createSession(userId) {
    try {
      const stringSession = new StringSession('');
      const client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
        connectionRetries: 5,
      });
      
      await client.start({
        phoneNumber: getUserInput.getPhoneNumber,
        password: getUserInput.getPassword,
        phoneCode: getUserInput.getCode,
        onError: (err) => console.log(err),
      });
      
      this.sessions.set(userId, {
        session: client.session.save(),
        client: client
      });
      
      return client;
    } catch (error) {
      console.error('Session creation error:', error);
      throw error;
    }
  }

  async getSession(userId) {
    return this.sessions.get(userId);
  }
}

module.exports = SessionManager;