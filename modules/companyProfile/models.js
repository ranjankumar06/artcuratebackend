const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const customer = {
    _id: { type: objectId, auto: true },
    companyName: { type: String, required: true },
    website: { type: String, required: true },
    email: { type: String, required: true },
    tagLine: { type: String, default: true },
    phone: { type: Number, required: true },
    fax: { type: Number, required: true },
    gst: { type: String, require: true },
    award: { type: String, require: true },
    certificate: { type: String, require: true },
    metaTag: { type: String, require: true },
    metaKeyword: { type: String, require: true },
    metaData: { type: String, default: true },
    metaDescription: { type: String, require: true },

    primaryAddress: { type: String, require: true },
    primaryCity: { type: String, require: true },
    primaryCountry: { type: String, require: true },
    primaryPinCode: { type: Number, require: true },
    billingAddress: { type: String, require: true },
    billingCity: { type: String, require: true },
    billingCountry: { type: String, require: true },
    billingPinCode: { type: Number, require: true },
    logo: { type: String, require: true },
    favicon: { type: String, require: true },
    establishedDate: Date,
    createdAt: Date,
    status: { type: Boolean, default: 1 }
}

const customerSchema = new Schema(customer, { versionKey: false, timestamps: true });

customerSchema.pre('save', function(next) {
	const currentDate = new Date();
    if (!this.createdDate){
        this.createdDate = currentDate;
    }
    next();
});

module.exports = mongoose.model("customerProfile", customerSchema);