class MessageHandler {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async sendMessage(fromUserId, toUserId, message) {
    try {
      const session = await this.sessionManager.getSession(fromUserId);
      if (!session) {
        throw new Error('Session not found. Please authenticate first.');
      }

      await session.client.sendMessage(toUserId, { message });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
}

module.exports = MessageHandler;