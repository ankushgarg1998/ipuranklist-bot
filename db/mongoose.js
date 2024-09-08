import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

export default {
    mongoose
}
