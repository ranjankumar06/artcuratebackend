const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const user = {
    _id: { type: objectId, auto: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    role: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: Number, required: true },
    phone: { type: Number, required: true },
    emailVerified: { type: Boolean, default: 0 },
    phoneVerified: { type: Boolean, default: 0 },
    org: { type: String, required: true },
    securityCode: Number,
    createdAt: Date,
    updatedAt: Date,
    status: { type: Boolean, default: 1 }
};
const userSchema = new Schema(user, { versionKey: false, timestamps: true });


// User Details
const userDetails = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    city: String,
    state: String,
    country: String,
    pinCode: String,
    region: String,
    timezone: String,
    createdAt: Date,
    updatedAt: Date
};
const userDetailsSchema = new Schema(userDetails, { versionKey: false, timestamps: true });

// User Group
const userCategory = {
  _id: { type: objectId, auto: true },
  category: {
    type: String,
    unique: true,
    required: true,
  },
  primaryRole: [String],
  secondaryRole: [String],
  isDeleted: {
    type: Number,
    default: 0,
  },
  createdAt: Date,
  updatedAt: Date,
};

const userCategorySchema = new Schema(userCategory, { versionKey: false, timestamps: true });

// User Profile Pics
const userProfilePics = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    profilePics: String,
    createdAt: Date,
    updatedAt: Date
};
const userProfilePicsSchema = new Schema(userProfilePics, { versionKey: false, timestamps: true });

// User Languages
const userLanguages = {
  _id: { type: objectId, auto: true },
  languages: String,
  createdAt: Date
};
const userLanguagesSchema = new Schema(userLanguages, { versionKey: false, timestamps: true });

// Upload Showcase
const showcaseType = {
    _id: { type: objectId, auto: true },
    showcaseId: String,
    showcaseType: String,
    status:{type:Boolean,default:1},
    createdAt: Date,
    updatedAt: Date,
};

const showcaseTypeSchema = new Schema(showcaseType, { versionKey: false, timestamps: true });

const priceTypes = {
  _id: { type: objectId, auto: true },
  priceType: String,
  status:{ type: Boolean, default:1 },
  createdAt: Date,
  updatedAt: Date
};
const priceTypeSchema = new Schema(priceTypes, { versionKey: false, timestamps: true });



const mainProducts = {
  _id: { type: objectId, auto: true },
  mProductId:String,
  mainProductName: String,
  packingType:{type:Boolean,default:1},
  metaKeyword: String,
  sortOrder: String,
  status:{type:Boolean,default:1},
  createdAt: Date,
  updatedAt: Date
};
const mainProductsSchema = new Schema(mainProducts, { versionKey: false, timestamps: true });

const productCategory = {
  _id: { type: objectId, auto: true },
  pCategoryId:String,
  ProductImage:String,
  mainProductName: String,
  categoryName: String,
  metaKeyword: String,
  sortOrder: String,
  status:{type:Boolean,default:1},
  createdAt: Date,
  updatedAt: Date
};
const productCategorySchema = new Schema(productCategory, { versionKey: false, timestamps: true });

const productSubCategory = {
  _id: { type: objectId, auto: true },
  pSubCategoryId:String,
  subCategoryImage:String,
  mainProductName: String,
  categoryName: String,
  subCategory:String,
  metaKeyword: String,
  sortOrder: String,
  status:{type:Boolean,default:1},
  createdAt: Date,
  updatedAt: Date
};
const productSubCategorySchema = new Schema(productSubCategory, { versionKey: false, timestamps: true });

const group1 = {
  _id: { type: objectId, auto: true },
  pGroup1Id:String,
  group1Image:String,
  mainProductName: String,
  categoryName: String,
  subCategory:String,
  group1:String,
  metaKeyword: String,
  sortOrder: String,
  status:{type:Boolean,default:1},
  createdAt: Date,
  updatedAt: Date
};
const group1Schema = new Schema(group1, { versionKey: false, timestamps: true });

const productGroup = {
  _id: { type: objectId, auto: true },
  pGroupId:String,
  productGroupImage:String,
  mainProductName: String,
  categoryName: String,
  subCategory:String,
  group1:String,
  productGroup:String,
  metaKeyword: String,
  sortOrder: String,
  status:{type:Boolean,default:1},
  createdAt: Date,
  updatedAt: Date
};
const productGroupSchema = new Schema(productGroup, { versionKey: false, timestamps: true });



const productUsability = {
  _id: { type: objectId, auto: true },
  pUsabilityId:String,
  mainProductName: String,
  productUsability: String,
  status:{type:Boolean,default:1},
  createdAt: Date,
  updatedAt: Date
};
const productUsabilitySchema = new Schema(productUsability, { versionKey: false, timestamps: true });

const packingType = {
  _id: { type: objectId, auto: true },
  packingType: String,
  status:{ type: Boolean, default:1 },
  createdAt: Date,
  updatedAt: Date
};
const packingTypeSchema = new Schema(packingType, { versionKey: false, timestamps: true });
const showcaseCategory = {
  _id: { type: objectId, auto: true },
  showcaseMain: { type: String, required: true },
  showcaseCategory: [String],
  showcaseSubcategory: [String],
  showcaseProductGroup: [String],
  showcaseGroup1: [String],
  showcaseGroup2: [String],
  showcaseProductBrand: [String],
  showcaseProductUsability: [String],
  createdAt: Date,
  updatedAt: Date,
};

const showcaseCategorySchema = new Schema(showcaseCategory, { versionKey: false, timestamps: true });
module.exports = {
    Auth: mongoose.model("admin", userSchema),
    Details: mongoose.model("adminDetails", userDetailsSchema),
    ProfilePics: mongoose.model("adminProfilePics", userProfilePicsSchema),
    UserCategory: mongoose.model("adminUserCategory", userCategorySchema),
    Language: mongoose.model("adminLanguage", userLanguagesSchema),
    ShowcaseType: mongoose.model("adminShowcaseType", showcaseTypeSchema),
    MainProducts: mongoose.model("mainProducts", mainProductsSchema),
    ProductCategory: mongoose.model("productCategory", productCategorySchema),
    ProductSubCategory: mongoose.model("productSubCategory", productSubCategorySchema),
    productGroup: mongoose.model("productGroup", productGroupSchema),
    Group1: mongoose.model("group1", group1Schema),
    Usability:mongoose.model("productUsability",productUsabilitySchema),
    Pricetypes: mongoose.model("priceTypes", priceTypeSchema),
    packing:mongoose.model("packingType",packingTypeSchema),
    ShowcaseCategory: mongoose.model("adminShowcaseCategory", showcaseCategorySchema)
};
