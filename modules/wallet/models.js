const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const wallets = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    amountStatus: { type: String, required: true },
    reason: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: Boolean, default: 1 },
    createdDate: Date
};
const walletSchema = new Schema(wallets, { versionKey: false });

walletSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});

// Fund Raiser
const fundRaise = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    productId: { type: objectId, required: true },
    amount: { type: Number, required: true },
    status: { type: Boolean, default: 1 },
    createdDate: Date
};
const fundRaiseSchema = new Schema(fundRaise, { versionKey: false });

fundRaiseSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});


const bid = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    productId: { type: objectId, required: true },
    amount: { type: Number, required: true },
    status: { type: Boolean, default: 1 },
    createdDate: Date
};
const bidSchema = new Schema(bid, { versionKey: false });

bidSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});

module.exports = {
    Wallet: mongoose.model("wallet", walletSchema),
    FundRaise: mongoose.model("fundRaise", fundRaiseSchema),
    Bid: mongoose.model("bid", bidSchema)
};