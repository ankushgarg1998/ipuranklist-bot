import { log } from './util/logger.js';
import SubscriptionDao from './daos/SubscriptionDao.js';

// -----------------------------------------------------------------------------------------------
// === TELEGRAM COMMAND HANDLER FUNCTIONS ===
// Function to handle 'fetch latest entries' commands.
const handleFetchCommand = async (dataObj, entryType, ctx) => {
    try {
        log(`=> Responding with 10 latest ${entryType} entries.\n`);
        await ctx.replyWithMarkdown(dataObj['savedMessages'][entryType]);
    } catch (err) {
        log(`=> Error in fetching:`);
        log(err);
        await ctx.replyWithMarkdown(`Some error occurred while fetching the ${entryType}s. Please report this to @ankushgarg1998`);
    }
};

// Function to handle 'subscribe' commands.
const handleSubscribeCommand = async (entryType, ctx) => {
    log(`Subscribe ${entryType} entries hit. -> ${ctx.chat.id} : ${ctx.chat.username || ctx.chat.first_name + " " + ctx.chat.last_name}`);
    try {
        const subscription = await SubscriptionDao.findActiveSubscription(ctx.chat.id, entryType);
        if (subscription) {
            log(`=> Already Subscribed.`);
            ctx.replyWithMarkdown(`You are already subscribed to ${entryType}s.`);
            return;
        }
        await SubscriptionDao.createOrActivateSubscription(ctx.chat.id, ctx.chat.username, entryType, ctx.chat.first_name, ctx.chat.last_name);
        log(`=> Subscription added.`);
        ctx.replyWithMarkdown(`You're now subscribed to ${entryType}s. You'll be notified as soon as any new ${entryType} is uploaded on the website. ✅`);
    } catch (err) {
        log(`=> Error in subscription:`);
        log(err);
        ctx.replyWithMarkdown(`There was an error in subscribing. Please report this to @ankushgarg1998`);
    }
};

// Function to handle 'unsubscribe' commands.
const handleUnsubscribeCommand = async (entryType, ctx) => {
    log(`Unsubscribe ${entryType} entries hit. -> ${ctx.chat.id} : ${ctx.chat.username || ctx.chat.first_name + " " + ctx.chat.last_name}`);
    try {
        const subscription = await SubscriptionDao.findActiveSubscription(ctx.chat.id, entryType);
        if (subscription) {
            await SubscriptionDao.deactivateSubscription(ctx.chat.id, entryType);
            log(`=> Unsubscribed.`);
            ctx.replyWithMarkdown(`You're now unsubscribed from ${entryType}s. ❌`);
            return;
        }
        log(`=> Already Unsubscribed.`);
        ctx.replyWithMarkdown(`You are not subscribed to ${entryType}s.`);
    } catch (err) {
        log(`=> Error in unsubscription:`);
        log(err);
        ctx.replyWithMarkdown(`There was an error in unsubscribing. Please report this to @ankushgarg1998`);
    }
};

export default {
    handleFetchCommand,
    handleSubscribeCommand,
    handleUnsubscribeCommand
};
