const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const banner = {
    _id: { type: objectId, auto: true },
    pics: String,
    createdDate: Date,
}

const bannerSchema = new Schema(banner, { versionKey: false });

bannerSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});

module.exports = {
    Banner: mongoose.model("banner", bannerSchema),
};