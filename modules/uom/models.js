const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
   
const uom = {
    _id: { type: objectId, auto: true },
    productType: { type: String, required: true },
    uom: Schema.Types.Mixed,
    createdDate: Date,
    updatedDate: Date,
    status: { type: Boolean, default: 1 }
};
const uomSchema = new Schema(uom, { versionKey: false });

uomSchema.pre('save', function (next) {
    const currentDate = new Date();
    this.updatedDate = currentDate;
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});

uomSchema.pre('findOneAndUpdate', function (next) {
    console.log("Pre Uom Update");
    this.updatedDate = new Date();
    next();
});


module.exports = mongoose.model("uom", uomSchema);