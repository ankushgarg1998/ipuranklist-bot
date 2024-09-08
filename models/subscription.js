import mongoose from 'mongoose';

const SUBSCRIPTION_MODEL_NAME = 'subscription';
const FIELD_CHAT_ID = 'chat_id';
const FIELD_USERNAME = 'username';
const FIELD_FIRST_NAME = 'first_name';
const FIELD_LAST_NAME = 'last_name';
const FIELD_ENTRY_TYPE = 'type';
const FIELD_STATUS = 'status';
const FIELD_CREATED_AT = 'created_at';
const FIELD_UPDATED_AT = 'updated_at';

const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'inactive';
const STATUS_BLOCKED = 'blocked';
const ALL_STATUSES = [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_BLOCKED];

const SubscriptionSchema = new mongoose.Schema({
    [FIELD_CHAT_ID]: {
        type: Number,
        required: true
    },
    [FIELD_USERNAME]: {
        type: String,
        trim: true
    },
    [FIELD_FIRST_NAME]: {
        type: String,
        trim: true,
    },
    [FIELD_LAST_NAME]: {
        type: String,
        trim: true,
    },
    [FIELD_ENTRY_TYPE]: {
        type: String,
        required: true,
        trim: true
    },
    [FIELD_STATUS]: {
        type: String,
        trim: true,
        default: STATUS_ACTIVE,
        enum: ALL_STATUSES
    },
    [FIELD_CREATED_AT]: {
        type: Date,
        default: Date.now
    },
    [FIELD_UPDATED_AT]: {
        type: Date,
        default: Date.now
    },
});

SubscriptionSchema.index({ [FIELD_CHAT_ID]: 1, [FIELD_ENTRY_TYPE]: 1 }, { unique: true });

const Subscription = mongoose.model(SUBSCRIPTION_MODEL_NAME, SubscriptionSchema);

export {
    Subscription,
    FIELD_CHAT_ID,
    FIELD_USERNAME,
    FIELD_FIRST_NAME,
    FIELD_LAST_NAME,
    FIELD_ENTRY_TYPE,
    FIELD_STATUS,
    FIELD_CREATED_AT,
    FIELD_UPDATED_AT,
    STATUS_ACTIVE,
    STATUS_INACTIVE,
    STATUS_BLOCKED,
};
