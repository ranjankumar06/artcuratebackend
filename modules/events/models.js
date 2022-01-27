const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

// Event
const eventCategory = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    collab: [{ type: objectId, required: true }],
    eventName: { type: String, required: true },
    // openDay: [{ type: String, required: true }],
    eventStartDate: { type: Date, require: true },
    eventEndDate: { type: Date, require: true },
    eventStartTime: { type: String, require: true },
    eventEndTime: { type: String, require: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    locationUrl: { type: String, required: true },
    attendType: { type: String, required: true },
    status: { type: Number, required: true },
    createdAt: Date,
    updatedAt: Date
};
const eventCategorySchema = new Schema(eventCategory, { versionKey: false, timestamps: true });


// Event Image
const eventImage = {
    _id: { type: objectId, auto: true },
    enevtId: { type: objectId, required: true },
    eventImage: Schema.Types.Mixed,
    eventVideo: Schema.Types.Mixed,
    createdAt: Date,
    updatedAt: Date
};

const eventImageSchema = new Schema(eventImage, { versionKey: false, timestamps: true });


// Event Details
const eventDetails = {
    _id: { type: objectId, auto: true },
    enevtId: { type: objectId, required: true },
    artistId: [{ type: objectId, required: true }],
    eventDescription: { type: String, required: true },
    packageType: { type: String, required: true },
    location: { type: String, required: true },
    originCountry: { type: String, required: true },
    shipingCountry: { type: String, required: true },
    createdAt: Date,
    updatedAt: Date
};
const eventDetailsSchema = new Schema(eventDetails, { versionKey: false, timestamps: true });


// Event Details
const eventReminder = {
    _id: { type: objectId, auto: true },
    enevtId: { type: objectId, required: true },
    userId: { type: objectId, required: true },
    reminderDate: { type: Date, required: true },
    createdAt: Date,
    updatedAt: Date
};
const eventReminderSchema = new Schema(eventReminder, { versionKey: false, timestamps: true });


module.exports = {
    Category: mongoose.model("event", eventCategorySchema),
    Image: mongoose.model("eventImage", eventImageSchema),
    Details: mongoose.model("eventDetails", eventDetailsSchema),
    Reminder: mongoose.model("eventReminder", eventReminderSchema)
};