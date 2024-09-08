import { log } from './util/logger.js';
import SubscriptionDao from './daos/SubscriptionDao.js';
import Constants from './Constants.js';

// -----------------------------------------------------------------------------------------------
// === SUBSCRIPTION MANAGER FUNCTIONS ===
// Function to unsubscribe a user from all entry types.
const blockSubscription = async (subscriber) => {
    try {
        const res = await SubscriptionDao.blockSubscriptions(subscriber.chat_id);
        if (res.nModified !== 0) {
            log(`=> Blocked all subscriptions for ${subscriber.chat_id}: ${subscriber.username}.`);
        } else {
            log(`=> Subscriptions already inactive.`);
        }
    } catch (err) {
        log(`=> Error in blocking subscriptions:`);
        log(err);
    }
};

// Function to notify a subscriber about updated entries of an entryType.
const notifySubscriber = async (entryType, subscriber, tg, dataObj) => {
    log(`=> Sending to ${subscriber.chat_id}: ${subscriber.username}`);
    const message = dataObj['savedMessages'][entryType];
    try {
        await tg.sendMessage(subscriber.chat_id, `🔴 *NEW ${entryType.toUpperCase()} ALERT*\n\n` + message, Constants.MARKDOWN);
        log(`=> Successful notification to ${subscriber.chat_id}: ${subscriber.username}.`);
    } catch (err) {
        log(`=> Failed to notify ${subscriber.chat_id}: ${subscriber.username}`);
        log(err);
        if (err.code === 403) {
            log(`=> User has blocked the bot. Unsubscribing ${subscriber.chat_id}: ${subscriber.username}.`);
            await blockSubscription(subscriber);
        }
    }
};

// Function to notify all subscriber about updated entries of an entryType.
const notifySubscribers = async (entryType, tg, dataObj) => {
    log(`=> Notifying all subscribers for ${entryType}.`);
    const subscribers = await SubscriptionDao.findActiveSubscriptions(entryType);
    return Promise.all(subscribers.map(subscriber => notifySubscriber(entryType, subscriber, tg, dataObj)));
};

// Function to notify all subscribers about updated entries of all entryTypes.
const notifyAllSubscribers = async (tg, dataObj, iterationUpdatesFound) => {
    return Promise.all(Constants.ALL_ENTRY_TYPES.map(entryType => {
        if (iterationUpdatesFound[entryType])
            return notifySubscribers(entryType, tg, dataObj);
    })).catch(err => {
        log(`=> Error in notifying subscribers:`);
        log(err);
    });
};

export default {
    notifyAllSubscribers
}
