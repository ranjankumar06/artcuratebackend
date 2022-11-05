const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

// Shop Details
const shopDetails = {
  _id: { type: objectId, auto: true },
  shopName: { type: String, required: [true, "Shop name is required"] },
  userId: { type: objectId, required: true, ref: "user" },
  shopType: { type: String },
  panNumber: {
    type: String,
    // validate: {
    //     validator: function (v) {
    //         var regex = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
    //         if (regex.test(v.toUpperCase())) {
    //             return true;
    //         }else{
    //             return false
    //         }
    //     },
    //     message: 'Enter a valid PAN number'
    // },
  },
  taxNumber: {
    type: String,
    // validate: {
    //     validator: function (v) {
    //         var regex = /(?:(?=(^[a-zA-Z]{5}\d{4}[a-zA-Z]{1}$))|(?=(^[a-zA-Z]{4}[0-9]{5}[a-zA-Z]{1}?$)))/gmi
    //         if (regex.test(v.toUpperCase())) {
    //             return true;
    //         }else{
    //             return false
    //         }
    //     },
    //     message: 'Enter a valid TAX number'
    // },
  },
  gstIn: {
    type: String,
    // validate: {
    //     validator: function (v) {
    //         var regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    //         if (regex.test(v.toUpperCase())) {
    //             return true;
    //         }else{
    //             return false
    //         }
    //     },
    //     message: 'Enter a valid GSTIN number'
    // },
  },
  email: { type: String, required: [true, "Email is required"], unique: true },
  phone: { type: Number, required: [true, "Number is required"] },
  fax: Number,
  contactName: String,
  designations: String,
  altphone: Number,
  tags: [String],
  active: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date,
};

const shopDetailsSchema = new Schema(shopDetails, {
  versionKey: false,
  timestamps: true,
});

// Shop Address
const shopAddress = {
  _id: { type: objectId, auto: true },
  shopId: { type: objectId, required: true },
  primaryAddressOne: {
    type: String,
    required: [true, "Primary address line is required"],
  },
  primaryAddressTwo: String,
  country: { type: String, required: [true, "Country is required"] },
  state: { type: String, required: [true, "State is required"] },
  city: { type: String, required: [true, "City is required"] },
  pinCode: { type: String, required: [true, "Pincode is required"] },
  pickup: { type: Boolean, required: [true, "pickup address is required"] },
  createdAt: Date,
  updatedAt: Date,
};

const shopAddressSchema = new Schema(shopAddress, {
  versionKey: false,
  timestamps: true,
});

// shop Account
const shopAccount = {
  _id: { type: objectId, auto: true },
  shopId: { type: objectId, required: true },
  accountNumber: {
    type: Number,
    required: [true, "Account number is required"],
  },
  accountName: { type: String, required: [true, "Account name is required"] },
  accountBranch: {
    type: String,
    required: [true, "Account branch is required"],
  },
  ifsc: { type: String, required: [true, "IFSC code is required"] },
  swiftCode: { type: String },
  upi: {
    type: String,
    validate: {
      validator: function (v) {
        var regex = /^[\w.-]+@[\w.-]+$/;
        if (regex.test(v.toUpperCase())) {
          return true;
        } else {
          return false;
        }
      },
      message: "Enter a valid UPI Id",
    },
    required: [true, "UPI id is required"],
  },
  createdAt: Date,
  updatedAt: Date,
};

const shopAccountSchema = new Schema(shopAccount, {
  versionKey: false,
  timestamps: true,
});

const subscriptions = {
  subscriptionId: { type: objectId, auto: true },
  shopId: { type: objectId, required: true },
  plan: { type: String, required: [true, "Plan is required"] },
  planType: { type: String, required: [true, "Plan type is required"] },
  validFrom: { type: Date },
  VaidTill: { type: Date },
  createdAt: Date,
  updatedAt: Date,
};

const subscriptionsSchema = new Schema(subscriptions, {
  versionKey: false,
  timestamps: true,
});

const shopAnnoucement = {
  _id: { type: objectId, auto: true },

  annoucement: {
    type: String,
    required: [true, "Shop announcement is required"],
  },
};

const shopAnnoucementSchema = new Schema(shopAnnoucement, { timestamps: true });

module.exports = {
  Details: mongoose.model("shopDetails", shopDetailsSchema),
  Address: mongoose.model("shopAddress", shopAddressSchema),
  Accounts: mongoose.model("shopAccount", shopAccountSchema),
  Subscriptions: mongoose.model("subscriptions", subscriptionsSchema),
  Annoucement: mongoose.model("shopAnnocement", shopAnnoucementSchema),
};
