const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { makeFolders } = require('./helpers/fileManager');
const { initializePuppeteer, closePuppeteer } = require("./config/puppeteer")
const { generateTokens } = require("./config/gocardless")

const folders = [
  'public/deals/logos',
  'public/deals/banners',
  'public/apps/logos',
  'public/apps/banners',
  'uploads/users/invoice/documents',
  'uploads/users/purchase/documents',
  'uploads/users/offer/documents',
  'uploads/users/settings/logos',
  'uploads/users/settings/bg_images',
  'uploads/users/transaction/documents'
]

let key, cert, options;

if (process.env.NODE_ENV !== 'development') {
  key = fs.readFileSync(__dirname + '/../privkey3.pem');
  cert = fs.readFileSync(__dirname + '/../fullchain3.pem');

  options = {
    key: key,
    cert: cert,
  };
}

let server = process.env.NODE_ENV === 'development' ? http.createServer(app) : https.createServer(options, app);

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  server = server.listen(config.port, async () => {
    logger.info(`Listening to port ${config.port}`);
    
    logger.info(`Creating required folders.`);
    
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      
      makeFolders(folder);
    }

    logger.info(`Folders created successfully.`);

    // initialize puppeteer and create's a browser instance
    await initializePuppeteer();
    
    // generate tokens for GoCardless client
    await generateTokens();
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  await closePuppeteer();
  exitHandler();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received');
  await closePuppeteer();
  exitHandler();
});