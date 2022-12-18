var fs = require('fs');
var cron = require('node-cron');
const axios = require('axios');
const { JSDOM } = require("jsdom");
const { Telegram, Telegraf } = require('telegraf');

require('./config/config');
var { mongoose } = require('./db/mongoose');
var { Subscription } = require('./models/subscription');
var { log } = require('./util/logger');
var { callGitHubActions } = require('./client/githubActionsClient');
var dataObj = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));


// -----------------------------------------------------------------------------------------------
// === INITIALIZATIONS ===
// Telegram object for sending texts on cron runs.
const tg = new Telegram(process.env.BOT_TOKEN);
// Bot object for handling commands.
const bot = new Telegraf(process.env.BOT_TOKEN);
const markD = { "parse_mode": "Markdown" };



// -----------------------------------------------------------------------------------------------
// === HELPER FUCTIONS ===
// Function to extract 10 result lines from the result HTML Page.
function extractEntriesFromPage(entryType, htmlPage) {
    let numberOfEntries = 10;
    let html = new JSDOM(htmlPage);
    let tb = html.window.document.querySelector("table").lastElementChild;
    let rows = [...tb.children].slice(0, numberOfEntries);
    let message = `📅 *RECENT ${numberOfEntries} ${entryType.toUpperCase()}S :*\n\n`;
    rows.forEach(row => {
        let dateElementMessage = "---";
        if (row.children.length !== 1) {
            dateElementMessage = getPossiblySpanWrappedElement(row.lastElementChild);
        }
        message += `*${dateElementMessage}:*\n`;
        let titleElementMessage = getPossiblySpanWrappedElement(row.firstElementChild);
        message += `${sanitizePdfTitle(titleElementMessage)}\n\n`;
    });
    return message;
}

// Get possibly span wrapped element
function getPossiblySpanWrappedElement(element) {
    let elementString = element.innerHTML.trim();
    return elementString.replace(/<\/?[^>]+(>|$)/g, '');
}

// Sanitize PDF Title
function sanitizePdfTitle(title) {
    return title
        .replace('\n\t', '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace('_', '-').trim();
}


// -----------------------------------------------------------------------------------------------
// === TELEGRAM COMMAND HANDLER FUNCTIONS ===
// Function to handle 'fetch latest entries' command
function handleFetchCommand(entryType, ctx) {
    log(`Latest ${entryType} entries hit.`);
    ctx.replyWithMarkdown(`Fetching recent ${entryType}s ⏳`)
    axios.get(dataObj.urls[entryType]).then(res => {
        let message = extractEntriesFromPage(entryType, res.data);
        log(`=> Responding with 10 latest ${entryType} entries.\n`);
        ctx.replyWithMarkdown(message);
    }, err => {
        log(`=> Error in fetching:`);
        log(err);
        ctx.replyWithMarkdown(`Some error occured while fetching the ${entryType}s. Please report this to @ankushgarg1998`);
    });
}

// Function to handle 'subscribe' commands
function handleSubscribeCommand(entryType, ctx) {
    log(`Subscribe ${entryType} entries hit. -> ${ctx.chat.id} : ${ctx.chat.username || ctx.chat.first_name + " " + ctx.chat.last_name}`);
    let subscriptionInstance = new Subscription({
        chat_id: ctx.chat.id,
        username: ctx.chat.username,
        type: entryType,
        first_name: ctx.chat.first_name,
        last_name: ctx.chat.last_name,
    });
    subscriptionInstance.save().then(savedSubscription => {
        log(`=> Subscription added.`);
        ctx.replyWithMarkdown(`You're now subscribed to ${entryType}s. You'll be notified as soon as any new ${entryType} is uploaded on the website. ✅`);
    }).catch(err => {
        log(err.message);
        if (err.code === 11000) {
            log(`=> Already Subscribed.`);
            ctx.replyWithMarkdown(`You are already subscribed to ${entryType}s.`)
        } else {
            log(`=> Error in subscription:`);
            log(err);
            ctx.replyWithMarkdown(`There was an error in subscribing. Please report this to @ankushgarg1998`);
        }
    });
}

// Function to handle 'unsubscribe' commands
function handleUnsubscribeCommand(entryType, ctx) {
    log(`Unsubscribe ${entryType} entries hit. -> ${ctx.chat.id} : ${ctx.chat.username || ctx.chat.first_name + " " + ctx.chat.last_name}`);
    let unsubscribeObject = {
        chat_id: ctx.chat.id,
        type: entryType
    };
    Subscription.deleteOne(unsubscribeObject).then(res => {
        if (res.deletedCount !== 0) {
            log(`=> Unsubscribed.`);
            ctx.replyWithMarkdown(`You're now unsubscribed from ${entryType}s. ❌`);
        } else {
            log(`=> Already Unsubscribed.`);
            ctx.replyWithMarkdown(`You are not subscribed to ${entryType}s.`)
        }
    }).catch(err => {
        log(`=> Error in unsubscription:`);
        log(err);
        ctx.replyWithMarkdown(`There was an error in unsubscribing. Please report this to @ankushgarg1998`);
    });
}

// Function to handle 'cron' executions
function handleCronExecution(entryType) {
    log(`Running the new-${entryType} checker cron.`);
    axios.get(dataObj.urls[entryType]).then(res => {
        let message = extractEntriesFromPage(entryType, res.data);
        if (message !== dataObj.savedMessages[entryType]) {
            log(`=> Cron found updated ${entryType} entries.`);
            callGitHubActions(entryType, message);
            Subscription.find({
                type: entryType
            }).then(subs => {
                log(`=> Sending to ${subs.length} subscribers.`);
                subs.forEach(sub => {
                    log(`=> Sending to ${sub.chat_id}: ${sub.username}`);
                    tg.sendMessage(sub.chat_id, `🔴 *NEW ${entryType.toUpperCase()} ALERT*\n\n` + message, markD)
                        .then(val => log(`=> Successful notification.`))
                        .catch(err => {
                            log(`=> Failed to notify`);
                            log(err);
                        })
                });
            }).catch(err => {
                log(`=> Error in db fetch:`);
                log(err);
                tg.sendMessage(dataObj.masterChatID, `Yo Ankush. Some error occured in ${entryType}-checker cron while fetching from db.\n`, markD)
                    .then(val => log(`=> Notified Ankush.`))
                    .catch(err => {
                        log('=> Unable to notify Ankush about the error :');
                        log(err);
                    });
            });
            dataObj.savedMessages[entryType] = message;
        } else {
            log('=> No updates.\n');
        }
    }, err => {
        log(`=> Error in cron execution:`);
        log(err);
        tg.sendMessage(dataObj.masterChatID, `Yo Ankush. Some error occured in ${entryType}-checker cron.\n`, markD)
            .then(val => log(`=> Notified Ankush.`))
            .catch(err => {
                log('=> Unable to notify Ankush about the error :');
                log(err);
            });
    });
}



// -----------------------------------------------------------------------------------------------
// === TELEGRAM COMMANDS CONTROLLERS ===
// --- FETCH COMMANDS ---
// Handling the fetch last 10 results.
bot.command('results', (ctx) => {
    let entryType = 'result';
    handleFetchCommand(entryType, ctx);
});

// Handling the fetch last 10 datesheets.
bot.command('datesheets', (ctx) => {
    let entryType = 'datesheet';
    handleFetchCommand(entryType, ctx);
});

// Handling the fetch last 10 circulars.
bot.command('circulars', (ctx) => {
    let entryType = 'circular';
    handleFetchCommand(entryType, ctx);
});

// --- SUBSCRIBE COMMANDS ---
// Subscribing to results
bot.command('subscriberesults', (ctx) => {
    let entryType = 'result';
    handleSubscribeCommand(entryType, ctx);
});

// Subscribing to datesheets
bot.command('subscribedatesheets', (ctx) => {
    let entryType = 'datesheet';
    handleSubscribeCommand(entryType, ctx);
});

// Subscribing to circulars
bot.command('subscribecirculars', (ctx) => {
    let entryType = 'circular';
    handleSubscribeCommand(entryType, ctx);
});

// --- UNSUBSCRIBE COMMANDS ---
// Subscribing to results
bot.command('unsubscriberesults', (ctx) => {
    let entryType = 'result';
    handleUnsubscribeCommand(entryType, ctx);
});

// Subscribing to datesheets
bot.command('unsubscribedatesheets', (ctx) => {
    let entryType = 'datesheet';
    handleUnsubscribeCommand(entryType, ctx);
});

// Subscribing to circulars
bot.command('unsubscribecirculars', (ctx) => {
    let entryType = 'circular';
    handleUnsubscribeCommand(entryType, ctx);
});

// --- HELP COMMANDS ---
// The start command.
bot.command('start', ((ctx) => ctx.replyWithMarkdown(dataObj.startMessage)));

// The help command.
bot.command('help', ((ctx) => ctx.replyWithMarkdown(dataObj.startMessage)));

// --- TEST COMMANDS ---
// Test command to check if the bot is running.
bot.command('test', ((ctx) => ctx.replyWithMarkdown('Test Successful.')));



// -----------------------------------------------------------------------------------------------
// === CRONS ===
// Cron frequency setup
var cronFrequency = '*/5 * * * *';

// Cron to update about result updates.
cron.schedule(cronFrequency, () => {
    let entryType = 'result';
    handleCronExecution(entryType);
});

// Cron to update about datesheet updates.
cron.schedule(cronFrequency, () => {
    let entryType = 'datesheet';
    handleCronExecution(entryType);
});

// Cron to update about circular updates.
cron.schedule(cronFrequency, () => {
    let entryType = 'circular';
    handleCronExecution(entryType);
});



// -----------------------------------------------------------------------------------------------
// === LAUNCH ===
// Launching the bot to handle all commands.
bot.launch();
log(`Telegram BOT started | ENV : ${process.env.ENVIRONMENT}`);
