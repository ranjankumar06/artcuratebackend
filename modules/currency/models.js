const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const currency = {
    _id: { type: objectId, auto: true },
    baseCurrency: { type: String, required: true },
    rate: Schema.Types.Mixed,
    createdDate: Date
}

const currencySchema = new Schema(currency, { versionKey: false });

module.exports = mongoose.model("currency", currencySchema);