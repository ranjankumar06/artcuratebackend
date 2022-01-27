const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

// {abbreviation: 'Ist', timezone: 'Indian Standard Time', currenttime: '15:47 PM', utcoffset: 'UTC+5:30', gmtoffset: 'GMT+5:30', createdby: 'SuperAdmin'} 

const timezone = {
    _id: { type: objectId, auto: true },
    abbreviation: { type: String, required: true },
    timezone: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdDate: Date,
    updatedDate: Date,
    status: { type: Boolean, default: 1 }
}

const timezoneSchema = new Schema(timezone, { versionKey: false });

timezoneSchema.pre('save', function (next) {
    const currentDate = new Date();
    this.updatedDate = currentDate;
    if (!this.createdDate) {
        this.createdDate = currentDate;
    }
    next();
});

module.exports = mongoose.model("timezone", timezoneSchema);