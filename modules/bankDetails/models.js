const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const bankDetails = {
    _id: { type: objectId, auto: true },
    bankUserId: { type: objectId, required: true },
    bankUserType: { type: String, required: true },
    accountName: { type: String, require: true },
    accountNumber: { type: Number, require: true },
    bankCode: { type: Number, required: true },
    bankName: { type: String, required: true },
    branchName: { type: String, required: true },
    IFSCCode: { type: String, required: true },
    currency: { type: String, required: true },
    accountType: { type: String, required: true },
    
    city: { type: String, require: true },
    state: { type: String, require: true },
    country: { type: String, require: true },
    pinCode: { type: String, require: true },
    createdAt: Date,
    status: { type: Boolean, default: 1 }
}

const bankDetailsSchema = new Schema(bankDetails, { versionKey: false, timestamps: true });

bankDetailsSchema.pre('save', function(next) {
	const currentDate = new Date();
    if (!this.createdDate){
        this.createdDate = currentDate;
    }
    next();
});

module.exports = mongoose.model("bankDetail", bankDetailsSchema);