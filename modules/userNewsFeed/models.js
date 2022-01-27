const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userFeed = {
    _id: { type: ObjectId, auto: true },
    userId: { type: ObjectId, required: true },
    newsType: String,
    productId: ObjectId,
    newsId: ObjectId,
    status: { type: Boolean, default: 1 },
    createdDate: { type: Date }
};
const userFeedSchema = new Schema(userFeed, { versionKey: false });

userFeedSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});

module.exports = mongoose.model("userFeed", userFeedSchema);