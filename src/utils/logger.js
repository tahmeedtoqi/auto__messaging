const winston = require('winston');
const chalk = require('chalk');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      const colorize = {
        info: chalk.blue,
        error: chalk.red,
        warn: chalk.yellow,
        debug: chalk.gray
      };
      
      return `${chalk.gray(timestamp)} ${colorize[level](level.toUpperCase())} ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;