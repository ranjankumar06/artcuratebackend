const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

// Product
const productCategory = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    creatorName: { type: String, required: true },
    collab: [{ type: objectId, required: true }],
    productName: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    productType: { type: String, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    // medium: { type: String, required: true },
    discPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    shape: { type: String, required: true },
    size: Schema.Types.Mixed,
    color: { type: String, required: true },
    rarity: { type: String, required: true },
    status: { type: Number, required: true },
    createdAt: Date,
    updatedAt: Date
};
const productCategorySchema = new Schema(productCategory, { versionKey: false, timestamps: true });


// Product Image
const productImage = {
    _id: { type: objectId, auto: true },
    productId: { type: objectId, required: true },
    productImage: Schema.Types.Mixed,
    productVideo: Schema.Types.Mixed,
    createdAt: Date,
    updatedAt: Date
};

const productImageSchema = new Schema(productImage, { versionKey: false, timestamps: true });


// Product Details
const productDetails = {
    _id: { type: objectId, auto: true },
    productId: { type: objectId, required: true },
    productDescription: { type: String, required: true },
    packageType: { type: String, required: true },
    waysToBuy: { type: String, required: true },
    buyFrom: { type: String, required: true },
    location: { type: String, required: true },
    originCountry: { type: String, required: true },
    shipingCountry: { type: String, required: true },
    createdIn: { type: Number},
    createdAt: Date,
    updatedAt: Date
};
const productDetailsSchema = new Schema(productDetails, { versionKey: false, timestamps: true });


// Product Varients
const productVariant = {
    _id: { type: objectId, auto: true },
    fieldName: { type: String, required: true },
    colors: Schema.Types.Mixed,
    size: Schema.Types.Mixed,
    shape: Schema.Types.Mixed,
    // pattern: Schema.Types.Mixed,    // Finishing Type, Painting Type
    // type: Schema.Types.Mixed,
    // material: Schema.Types.Mixed,
    // frame: Schema.Types.
    style: Schema.Types.Mixed,
    packingType: Schema.Types.Mixed,
    createdAt: Date,
    updatedAt: Date,
};
const productVariantSchema = new Schema(productVariant, { versionKey: false, timestamps: true });

module.exports = {
    Category: mongoose.model("product", productCategorySchema),
    Image: mongoose.model("productImage", productImageSchema),
    Details: mongoose.model("productDetails", productDetailsSchema),
    Variant: mongoose.model("productVariant", productVariantSchema)
};