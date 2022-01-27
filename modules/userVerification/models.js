const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const userVerification = {
    _id: { type: objectId, auto : true },
    userId: { type: objectId, required : true },
    name: { type : String },
    email: { type : String },
    phone: { type : String },
    knownAs: { type : String },
    category: { type : String },
    subCategory: [{ type : String }],
    POI: String,
    idNumber: String,
    document: [{ type : String }],
    isVerified: { type : Boolean, default : 0 },
    isReject: { type: Boolean, default : 0 },
    isCurator: { type: Boolean, default : 1},
    isRejectDate: { type : Date, default : Date.now },
    verificationDate: {type: Date, default : Date.now },
    createdAt: { type: Date, default : Date.now },
    updatedAt: { type: Date, default : Date.now },
};

const userVerificationSchema = new Schema(userVerification, { versionKey : false });

module.exports= {
    Verification: mongoose.model("userVerification", userVerificationSchema),
};
