var fs = require('fs');
var cron = require('node-cron');
const axios = require('axios');
const { JSDOM } = require("jsdom");
const { Telegram, Telegraf } = require('telegraf');

const keys = require('./config/keys')
var dataObj = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));


// --- INITIALIZATIONS ---
// Telegram object for sending texts on cron runs.
const tg = new Telegram(keys.token);
// Bot object for handling commands.
const bot = new Telegraf(keys.token);
const markD = { "parse_mode": "Markdown" };


// --- HELPER FUCTIONS ---
// Function to extract 10 result lines from the result HTML Page.
function extractResultsFromPage(htmlPage) {
    let html = new JSDOM(htmlPage);
    let tb = html.window.document.querySelector("table").lastElementChild;
    let rows = [...tb.children].slice(0, 10);
    let message = '*LAST 10 Results:*\n\n';
    rows.forEach(row => {
        message += row.firstElementChild.firstElementChild.innerHTML.replace('\n\t', '').trim();
        message += ' ==> ';
        message += row.lastElementChild.innerHTML.trim();
        message += '\n\n';
    });
    return message;
}


// --- COMMANDS ---
// Handling the fetch last 10 results.
bot.command('latestresults', (ctx) => {
    console.log('Latest Results Hit');
    axios.get(dataObj.resultURL).then(res => {
            let message = extractResultsFromPage(res.data);
            console.log('=> Responding with 10 latest results.\n');
            ctx.replyWithMarkdown(message);
        }, err => {
            console.log(err);
            ctx.reply('Some error occured.\n');
        });
});

// Test command to check if the bot is running.
bot.command('test', ((ctx) => ctx.reply('Test Successful.')));


// --- CRONS ---
// Cron to update about result updates.
cron.schedule('* * * * *', () => {
    console.log('Running the new-result checker cron.');
    axios.get(dataObj.resultURL).then(res => {
            let message = extractResultsFromPage(res.data);
            if(message !== dataObj.resultMessage) {
                console.log('=> Responding with 10 latest results.\n');
                tg.sendMessage(dataObj.masterChatID, '*NEW RESULT ALERT*\n\n' + message, markD);
                dataObj.resultMessage = message;
            } else {
                console.log('=> No updates.\n');
            }
        }, err => {
            console.log(err);
            tg.sendMessage(dataObj.masterChatID, 'Some error occured in result-checker cron.\n', markD);
        });
});


// --- LAUNCH ---
// Launching the bot to handle all commands.
bot.launch();
console.log('Telegram BOT started.');