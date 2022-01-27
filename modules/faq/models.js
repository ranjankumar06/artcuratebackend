const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const faq = {
    _id: { type: objectId, auto: true },
    category: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdDate: Date,
    status: { type: Boolean, default: 1 }
}

const faqSchema = new Schema(faq, { versionKey: false });

faqSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});

module.exports = mongoose.model("faq", faqSchema);