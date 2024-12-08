const { Telegraf } = require('telegraf');
const config = require('./config');
const SessionManager = require('./services/sessionManager');
const MessageHandler = require('./handlers/messageHandler');
const logger = require('./utils/logger');

const bot = new Telegraf(config.botToken);
const sessionManager = new SessionManager(config.apiId, config.apiHash);
const messageHandler = new MessageHandler(sessionManager);

let awaitingTargetId = new Set();
let awaitingMessage = new Map();

// Command to start the bot
bot.command('start', (ctx) => {
  const userId = ctx.from.id;
  logger.info(`New user started the bot: ${userId}`);
  ctx.reply('Welcome! Use this bot to send messages to other Telegram users.\n\n' +
            'Available commands:\n' +
            '/auth - Authenticate with your Telegram account\n' +
            '/send - Send a message to another user\n' +
            '/help - Show this help message');
});

// Command to show help
bot.command('help', (ctx) => {
  ctx.reply('How to use this bot:\n\n' +
            '1. First use /auth to authenticate with your Telegram account\n' +
            '2. Use /send to start sending a message\n' +
            '3. Enter the recipient\'s information (you can use):\n' +
            '   - Telegram ID (e.g., 123456789)\n' +
            '   - Username (e.g., @username)\n' +
            '   - Phone number (e.g., +1234567890)\n' +
            '4. Enter your message\n\n' +
            'The bot will then send your message to the specified user.');
});

// Command to authenticate user
bot.command('auth', async (ctx) => {
  try {
    const userId = ctx.from.id;
    logger.info(`Authentication requested by user ${userId}`);
    await sessionManager.createSession(userId);
    ctx.reply('Authentication successful! You can now use /send to send messages.');
    logger.info(`User ${userId} authenticated successfully`);
  } catch (error) {
    ctx.reply('Authentication failed. Please try again.');
    logger.error(`Authentication failed for user ${ctx.from.id}:`, error);
  }
});

// Command to send message
bot.command('send', (ctx) => {
  const userId = ctx.from.id;
  logger.info(`Send command initiated by user ${userId}`);
  awaitingTargetId.add(userId);
  ctx.reply('Please enter the recipient\'s information:\n' +
            '- Telegram ID (e.g., 123456789)\n' +
            '- Username (e.g., @username)\n' +
            '- Phone number (e.g., +1234567890)');
});

// Handle text messages
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  if (text.startsWith('/')) return;

  if (awaitingTargetId.has(userId)) {
    logger.info(`Received target ID from user ${userId}: ${text}`);
    awaitingTargetId.delete(userId);
    awaitingMessage.set(userId, text);
    ctx.reply('Now enter the message you want to send:');
  } else if (awaitingMessage.has(userId)) {
    const targetId = awaitingMessage.get(userId);
    awaitingMessage.delete(userId);
    
    logger.info(`Attempting to send message from ${userId} to ${targetId}`);
    const success = await messageHandler.sendMessage(userId, targetId, text);
    
    if (success) {
      ctx.reply('Message sent successfully!');
      logger.info(`Message sent successfully from ${userId} to ${targetId}`);
    } else {
      ctx.reply('Failed to send message. Please check the recipient\'s information and try again.\n' +
                'Make sure you\'re authenticated (/auth) and the recipient information is correct.');
      logger.error(`Failed to send message from ${userId} to ${targetId}`);
    }
  }
});

// Error handling
bot.catch((err, ctx) => {
  logger.error('Bot error:', err);
  ctx.reply('An error occurred. Please try again later.');
});

logger.info('Starting Telegram bot...');
bot.launch()
  .then(() => {
    logger.info('Bot is running and ready to accept connections');
  })
  .catch(err => {
    logger.error('Bot launch error:', err);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  logger.info('Received SIGINT signal, shutting down...');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  logger.info('Received SIGTERM signal, shutting down...');
  bot.stop('SIGTERM');
});