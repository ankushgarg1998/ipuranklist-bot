var fs = require('fs');
var cron = require('node-cron');
const axios = require('axios');
const { JSDOM } = require("jsdom");
const { Telegram, Telegraf } = require('telegraf');

const keys = require('./config/keys')
var dataObj = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));


// -----------------------------------------------------------------------------------------------
// --- INITIALIZATIONS ---
// Telegram object for sending texts on cron runs.
const tg = new Telegram(keys.token);
// Bot object for handling commands.
const bot = new Telegraf(keys.token);
const markD = { "parse_mode": "Markdown" };



// -----------------------------------------------------------------------------------------------
// --- HELPER FUCTIONS ---
// Function to extract 10 result lines from the result HTML Page.
function extractEntriesFromPage(entryType, htmlPage) {
    let numberOfEntries = 10;
    let html = new JSDOM(htmlPage);
    let tb = html.window.document.querySelector("table").lastElementChild;
    let rows = [...tb.children].slice(0, numberOfEntries);
    let message = `📅 *RECENT ${numberOfEntries} ${entryType.toUpperCase()}S :*\n\n`;
    rows.forEach(row => {
        message += row.lastElementChild.innerHTML.trim();
        message += ' :\n';
        message += row.firstElementChild.firstElementChild.innerHTML.replace('\n\t', '').trim();
        message += '\n\n';
    });
    return message;
}



// -----------------------------------------------------------------------------------------------
// --- COMMANDS ---
// Handling the fetch last 10 results.
bot.command('latestResults', (ctx) => {
    let entrytype = 'result';
    console.log(`Latest ${entrytype} entries hit.`);
    axios.get(dataObj.urls[entrytype]).then(res => {
        let message = extractEntriesFromPage(entrytype, res.data);
        console.log(`=> Responding with 10 latest ${entrytype} entries.\n`);
        ctx.replyWithMarkdown(message);
    }, err => {
        console.log(err);
        ctx.reply('Some error occured.\n');
    });
});

//Handling the fetch last 10 datesheets.
bot.command('latestDatesheets', (ctx) => {
    let entrytype = 'datesheet';
    console.log(`Latest ${entrytype} entries hit.`);
    axios.get(dataObj.urls[entrytype]).then(res => {
        let message = extractEntriesFromPage(entrytype, res.data);
        console.log(`=> Responding with 10 latest ${entrytype} entries.\n`);
        ctx.replyWithMarkdown(message);
    }, err => {
        console.log(err);
        ctx.reply('Some error occured.\n');
    });
});

//Handling the fetch last 10 circulars.
bot.command('latestCirculars', (ctx) => {
    let entrytype = 'circular';
    console.log(`Latest ${entrytype} entries hit.`);
    axios.get(dataObj.urls[entrytype]).then(res => {
        let message = extractEntriesFromPage(entrytype, res.data);
        console.log(`=> Responding with 10 latest ${entrytype} entries.\n`);
        ctx.replyWithMarkdown(message);
    }, err => {
        console.log(err);
        ctx.reply('Some error occured.\n');
    });
});

// Test command to check if the bot is running.
bot.command('test', ((ctx) => ctx.reply('Test Successful.')));



// -----------------------------------------------------------------------------------------------
// --- CRONS ---
// Cron frequency setup
var cronFrequency = '*/5 * * * *';

// Cron to update about result updates.
cron.schedule(cronFrequency, () => {
    let entryType = 'result';
    console.log(`Running the new-${entryType} checker cron.`);
    axios.get(dataObj.urls[entryType]).then(res => {
        let message = extractEntriesFromPage(entryType, res.data);
        if (message !== dataObj.savedMessages[entryType]) {
            console.log(`=> Responding with 10 latest ${entryType} entries.\n`);
            tg.sendMessage(dataObj.masterChatID, `🔴 *NEW ${entryType.toUpperCase()} ALERT*\n\n` + message, markD);
            dataObj.savedMessages[entryType] = message;
        } else {
            console.log('=> No updates.\n');
        }
    }, err => {
        console.log(err);
        tg.sendMessage(dataObj.masterChatID, `Some error occured in ${entryType}-checker cron.\n`, markD);
    });
});

// Cron to update about datesheet updates.
cron.schedule(cronFrequency, () => {
    let entryType = 'datesheet';
    console.log(`Running the new-${entryType} checker cron.`);
    axios.get(dataObj.urls[entryType]).then(res => {
        let message = extractEntriesFromPage(entryType, res.data);
        if (message !== dataObj.savedMessages[entryType]) {
            console.log(`=> Responding with 10 latest ${entryType} entries.\n`);
            tg.sendMessage(dataObj.masterChatID, `🔴 *NEW ${entryType.toUpperCase()} ALERT*\n\n` + message, markD);
            dataObj.savedMessages[entryType] = message;
        } else {
            console.log('=> No updates.\n');
        }
    }, err => {
        console.log(err);
        tg.sendMessage(dataObj.masterChatID, `Some error occured in ${entryType}-checker cron.\n`, markD);
    });
});

// Cron to update about circular updates.
cron.schedule(cronFrequency, () => {
    let entryType = 'circular';
    console.log(`Running the new-${entryType} checker cron.`);
    axios.get(dataObj.urls[entryType]).then(res => {
        let message = extractEntriesFromPage(entryType, res.data);
        if (message !== dataObj.savedMessages[entryType]) {
            console.log(`=> Responding with 10 latest ${entryType} entries.\n`);
            tg.sendMessage(dataObj.masterChatID, `🔴 *NEW ${entryType.toUpperCase()} ALERT*\n\n` + message, markD);
            dataObj.savedMessages[entryType] = message;
        } else {
            console.log('=> No updates.\n');
        }
    }, err => {
        console.log(err);
        tg.sendMessage(dataObj.masterChatID, `Some error occured in ${entryType}-checker cron.\n`, markD);
    });
});



// -----------------------------------------------------------------------------------------------
// --- LAUNCH ---
// Launching the bot to handle all commands.
bot.launch();
console.log('Telegram BOT started.');