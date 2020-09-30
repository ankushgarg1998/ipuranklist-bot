'use strict';

const Telegram = require('telegram-node-bot');
const keys = require('./config/keys')
const tg = new Telegram.Telegram(keys.token, {
    workers: 1
});

const CommandController = require('./controllers/command');
const OtherwiseController = require('./controllers/otherwise');

const commandController = new CommandController();

tg.router
    .when(new Telegram.TextCommand('/start', 'helpCommand'), commandController)
    .when(new Telegram.TextCommand('/help', 'helpCommand'), commandController)
    
    .when(new Telegram.TextCommand('/test', 'testCommand'), commandController)
    .when(new Telegram.)
    .otherwise(new OtherwiseController());
