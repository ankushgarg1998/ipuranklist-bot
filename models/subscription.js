var mongoose = require('mongoose');

var SubscriptionSchema = new mongoose.Schema({
    chat_id: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    }
});

SubscriptionSchema.index({chat_id:1, type:1}, { unique: true });

var Subscription = mongoose.model('subscription', SubscriptionSchema);

module.exports = { Subscription };