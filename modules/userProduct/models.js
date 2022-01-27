const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

// Product
const product = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    shopId:{ type: objectId, required: true },
    itemName: { type: String, required: true },
    itemDescription:{type:String,required:true},
    mainCategory: { type: String, required: true },
    productCreatedBy: { type:String},
    tags:{type:String},
    productCompletion:{type:String},
    completionDate:{type:String},
    mediumMaterials:{type:String},
    createdAt: Date,
    updatedAt: Date
};
const productCategorySchema = new Schema(productCategory, { versionKey: false, timestamps: true });

const productRarity={
    _id: { type: objectId, auto: true },
    productId: { type: objectId, required: true},
    rarity: { type: String, required: true },
    size: Schema.Types.Mixed,
    width: { type: String, required: true },
    depth: { type: String, required: true },
    height: { type: String, required: true },
    price: { type: Number, required: true },
    diskPrice: { type: Number, required: true },
    color: [{type: String, required: true }],
    
    uom: { type: Number, required: true },
    createdAt: Date,
    updatedAt: Date
}

const productRaritySchema = new Schema(productRarity, { versionKey: false, timestamps: true });

// Product Image
const productImage = {
    _id: { type: objectId, auto: true },
    productId: { type: objectId, required: true },
    productImage: [{type:String}],
    productVideo: {type:String},
    createdAt: Date,
    updatedAt: Date
};

const productImageSchema = new Schema(productImage, { versionKey: false, timestamps: true });