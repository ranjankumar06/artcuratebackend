const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

// Gallery
const gallery = {
    _id: { type: objectId, auto: true },
    ownerId: { type: objectId, required: true },
    collab: [{ type: objectId, required: true }],
    galleryName: { type: String, required: true },
    openDay: [{ type: String, required: true }],
    bookingStartTime: { type: String, require: true },
    bookingEndTime: { type: String, require: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    location: { type: String, required: true },
    locationUrl: { type: String, required: true },
    status: { type: Boolean, default: 1 },
    createdAt: Date,
    updatedAt: Date
};
const gallerySchema = new Schema(gallery, {
    versionKey: false,
    timestamps: true
});


// Gallery Details
const galleryDetails = {
    _id: { type: objectId, auto: true },
    galleryId: { type: objectId, required: true },
    galleryDescription: { type: String, required: true },
    createdAt: Date,
    updatedAt: Date
};
const galleryDetailsSchema = new Schema(galleryDetails, { versionKey: false, timestamps: true });


// Gallery Image
const galleryImage = {
    _id: { type: objectId, auto: true },
    enevtId: { type: objectId, required: true },
    eventImage: Schema.Types.Mixed,
    eventVideo: Schema.Types.Mixed,
    createdAt: Date,
    updatedAt: Date
};

const galleryImageSchema = new Schema(galleryImage, { versionKey: false, timestamps: true });

module.exports = {
    Gallery: mongoose.model("gallery", gallerySchema),
    GalleryDetails: mongoose.model("galleryDetails", galleryDetailsSchema),
    Image: mongoose.model("galleryImage", galleryImageSchema)
};