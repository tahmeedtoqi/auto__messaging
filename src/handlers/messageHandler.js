const logger = require('../utils/logger');
const { Api } = require('telegram');

class MessageHandler {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    logger.info('Message handler initialized');
  }

  async sendMessage(fromUserId, toUserId, message) {
    try {
      logger.info(`Attempting to send message from user ${fromUserId} to ${toUserId}`);
      const session = await this.sessionManager.getSession(fromUserId);
      
      if (!session) {
        logger.error(`No session found for user ${fromUserId}`);
        throw new Error('Session not found. Please authenticate first.');
      }

      // First try to get the entity
      let entity;
      try {
        entity = await session.client.getEntity(toUserId);
      } catch (error) {
        logger.warn(`Could not get entity directly, trying to resolve by username/phone...`);
        // Try to resolve as username if it starts with @
        if (toUserId.startsWith('@')) {
          entity = await session.client.getEntity(toUserId);
        } else {
          // Try to resolve as phone number if it starts with +
          if (toUserId.startsWith('+')) {
            const contacts = await session.client.getContacts();
            entity = contacts.find(contact => contact.phone === toUserId);
          } else {
            // Try to resolve as numeric ID
            const numericId = parseInt(toUserId, 10);
            if (!isNaN(numericId)) {
              entity = await session.client.getEntity(new Api.PeerUser({
                userId: numericId
              }));
            }
          }
        }
      }

      if (!entity) {
        throw new Error('Could not find the specified user. Please check the ID/username/phone and try again.');
      }

      await session.client.sendMessage(entity, { message });
      logger.info('Message sent successfully');
      return true;
    } catch (error) {
      logger.error('Error sending message:', error);
      return false;
    }
  }
}

module.exports = MessageHandler;