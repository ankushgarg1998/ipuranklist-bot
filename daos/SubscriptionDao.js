import {
    Subscription,
    FIELD_CHAT_ID,
    FIELD_USERNAME,
    FIELD_ENTRY_TYPE,
    FIELD_FIRST_NAME,
    FIELD_LAST_NAME,
    FIELD_STATUS,
    FIELD_UPDATED_AT,
    STATUS_ACTIVE,
    STATUS_INACTIVE,
    STATUS_BLOCKED
} from "../models/subscription.js";

const buildSubscription = (chatId,
                           username,
                           entryType,
                           firstName,
                           lastName) => {
    return {
        [FIELD_CHAT_ID]: chatId,
        [FIELD_USERNAME]: username,
        [FIELD_ENTRY_TYPE]: entryType,
        [FIELD_FIRST_NAME]: firstName,
        [FIELD_LAST_NAME]: lastName,
        [FIELD_STATUS]: STATUS_ACTIVE,
        [FIELD_UPDATED_AT]: Date.now()
    };
};

const createOrActivateSubscription = async (chatId, username, entryType, firstName, lastName) => {
    const findSubscriptionQuery = {
        [FIELD_CHAT_ID]: chatId,
        [FIELD_ENTRY_TYPE]: entryType
    };
    const newSubscription = buildSubscription(chatId, username, entryType, firstName, lastName);
    return Subscription.findOneAndReplace(findSubscriptionQuery, newSubscription, { upsert: true });
}

const findActiveSubscription = async (chatId, entryType) => {
    const findSubscriptionQuery = {
        [FIELD_CHAT_ID]: chatId,
        [FIELD_ENTRY_TYPE]: entryType,
        [FIELD_STATUS]: STATUS_ACTIVE
    };
    return Subscription.findOne(findSubscriptionQuery);
};

const findActiveSubscriptions = async (entryType) => {
    const findSubscriptionQuery = {
        [FIELD_ENTRY_TYPE]: entryType,
        [FIELD_STATUS]: STATUS_ACTIVE
    };
    return Subscription.find(findSubscriptionQuery);
};

const deactivateSubscription = async (chatId, entryType) => {
    const findSubscriptionQuery = {
        [FIELD_CHAT_ID]: chatId,
        [FIELD_ENTRY_TYPE]: entryType,
        [FIELD_STATUS]: STATUS_ACTIVE
    };
    const updateFields = {
        [FIELD_STATUS]: STATUS_INACTIVE,
        [FIELD_UPDATED_AT]: Date.now()
    };
    return Subscription.findOneAndUpdate(findSubscriptionQuery, { $set: updateFields });
};

const blockSubscriptions = async (chatId) => {
    const findSubscriptionsQuery = {
        [FIELD_CHAT_ID]: chatId,
        [FIELD_STATUS]: STATUS_ACTIVE
    };
    const updateFields = {
        [FIELD_STATUS]: STATUS_BLOCKED,
        [FIELD_UPDATED_AT]: Date.now()
    };
    return Subscription.updateMany(findSubscriptionsQuery, { $set: updateFields });
};

export default {
    buildSubscription,
    createOrActivateSubscription,
    findActiveSubscription,
    findActiveSubscriptions,
    deactivateSubscription,
    blockSubscriptions
}
