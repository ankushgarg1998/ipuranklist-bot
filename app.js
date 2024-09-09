import fs from 'fs';
import axios from 'axios';
import { Telegram, Telegraf } from 'telegraf';
import './config/config.js';
import { log } from './util/logger.js';
import mongoose from './db/mongoose.js';


import Constants from './Constants.js';
import entryHelper from './entryHelper.js';
import commandController from './commandController.js';
import subscriptionManager from "./subscriptionManager.js";

const dataObj = JSON.parse(fs.readFileSync(Constants.DATA_FILE_PATH, 'utf8'));


// -----------------------------------------------------------------------------------------------
// === INITIALIZATIONS ===
// Telegram object for sending texts on cron runs.
const tg = new Telegram(process.env.BOT_TOKEN);
// Bot object for handling commands.
const bot = new Telegraf(process.env.BOT_TOKEN);
const iterationUpdatesFound = {};


// -----------------------------------------------------------------------------------------------
// === MAIN FUNCTIONS ===
// Function to fetch latest entries and update the dataObj.
const updateEntries = async (entryType) => {
    try {
        log(`Updating ${entryType} entries.`);
        const htmlResponse = await axios.get(dataObj.urls[entryType], {
            signal: AbortSignal.timeout(Constants.AXIOS_RESPONSE_TIMEOUT),
            timeout: Constants.AXIOS_RESPONSE_TIMEOUT
        });
        const message = entryHelper.extractEntriesFromPage(entryType, htmlResponse.data);
        if (message !== dataObj['savedMessages'][entryType]) {
            log(`=> Found new ${entryType} entries.\n`);
            dataObj['savedMessages'][entryType] = message;
            iterationUpdatesFound[entryType] = true;
        } else {
            log(`=> No ${entryType} updates.\n`);
        }
    } catch (err) {
        log(`=> Error in fetching ${entryType} entries:`);
        log(err);
        await tg.sendMessage(dataObj['masterChatID'], `-ERROR-\nError in fetching ${entryType} entries.\n`, Constants.MARKDOWN);
    }
};

const setupBotCommands = () => {
    Constants.COMMAND_ENTRY_LIST.forEach(([command, entryType]) => {
        bot.command(command, (ctx) => commandController.handleFetchCommand(dataObj, entryType, ctx));
        bot.command(`${Constants.COMMAND_SUBSCRIBE}${command}`, (ctx) => commandController.handleSubscribeCommand(entryType, ctx));
        bot.command(`${Constants.COMMAND_UNSUBSCRIBE}${command}`, (ctx) => commandController.handleUnsubscribeCommand(entryType, ctx));
    });
    bot.command('start', ((ctx) => ctx.replyWithMarkdown(dataObj['startMessage'])));
    bot.command('help', ((ctx) => ctx.replyWithMarkdown(dataObj['startMessage'])));
    bot.command('test', ((ctx) => ctx.replyWithMarkdown('Test Successful.')));
};

const afterMain = () => {
    log('=> Main executed. Starting bot.');
    setupBotCommands();
    bot.launch();
    setTimeout(() => {
        log('=> Stopping bot. Exiting process.');
        process.exit(0);
    }, Constants.BOT_UPTIME);
}


// -----------------------------------------------------------------------------------------------
// === EXECUTION ===
const main = async () => {
    await Promise.all(Constants.ALL_ENTRY_TYPES.map(updateEntries));
    if (Object.values(iterationUpdatesFound).includes(true)) {
        log('=> Found updates. Writing to file.');
        entryHelper.writeDataFile(dataObj);
    }
    await subscriptionManager.notifyAllSubscribers(tg, dataObj, iterationUpdatesFound);
};

log(`Script started | ENV : ${process.env.ENVIRONMENT}`);
main()
    .then(afterMain);

// -----------------------------------------------------------------------------------------------
// === GRACEFUL STOP ===
Constants.GRACEFUL_STOP_SIGNALS.forEach(signal => {
    process.on(signal, () => {
        log(`Received signal: ${signal}. Stopping bot`);
        bot.stop(signal);
    });
});
