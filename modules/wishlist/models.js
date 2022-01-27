const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const wishlist = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    productId: { type: objectId, required: true },
    status: { type: Boolean, default: 1 },
    createdDate: { type: Date }
};
const wishlistSchema = new Schema(wishlist, { versionKey: false });

wishlistSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});

module.exports = mongoose.model("wishlist", wishlistSchema);