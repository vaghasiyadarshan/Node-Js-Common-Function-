const puppeteer = require('puppeteer');
const logger = require("./logger");

let browser;

async function initializePuppeteer() {
  try {
    if (browser) {
      await browser.close();
    }

    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox'],
    });

    logger.info("Browser launched successfully");
  } catch (error) {
    logger.error("Browser cannot be launched");
  }
}

async function closePuppeteer() {
  try {
    if (browser) {
      await browser.close();
    }

    logger.info("Browser closed successfully");
  } catch (error) {
    logger.error("Browser cannot be closed");
  }
}

function getBrowserInstance() {
  return browser
}

module.exports = {
  initializePuppeteer,
  getBrowserInstance,
  closePuppeteer
}