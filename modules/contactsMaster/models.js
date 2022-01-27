const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;


const vendor = {
    _id: { type: objectId, auto: true },
    vendorName: { type: String, required: true },
    vendorType: { type: String, required: true },
    vendorWebsite: { type: String, required: true },
    pan: { type: String, required: true },
    tan: { type: String, required: true },
    gst: { type: String },
    natureOfBusiness: { type: String },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    mobile: { type: Number, required: true },
    fax: { type: Number },
    contact: { type: String },
    designation: { type: String },
    awards: { type: String },
    certificates: { type: String },
    metaTag: { type: String },
    metaKeyword: { type: String },
    metaData: { type: String },
    metaDescription: { type: String },
    product: { type: String, require: true },
    
    primaryAddress: { type: String, require: true },
    primaryCity: { type: String, require: true },
    primaryCountry: { type: String, require: true },
    primaryPinCode: { type: Number, require: true },
    billingAddress: { type: String, require: true },
    billingCity: { type: String, require: true },
    billingCountry: { type: String, require: true },
    billingPinCode: { type: Number, require: true },
    logo: { type: String, require: true },
    establishedDate: Date,
    createdAt: Date,
    updatedAt: Date,
    status: { type: Boolean, default: 1 },
    deleteVendor: { type: Boolean, default: 0 }

    
};
const vendorSchema = new Schema(vendor, { versionKey: false, timestamps: true });


// Customers
const customers = {
    _id: { type: objectId, auto: true },
    group: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    dob: Date,
    gst: { type: String },
    primaryAddress: { type: String, require: true },
    primaryStreet: { type: String, require: true },
    primaryCity: { type: String, require: true },
    primaryCountry: { type: String, require: true },
    primaryPinCode: { type: Number, require: true },
    billingAddress: { type: String, require: true },
    billingStreet: { type: String, require: true },
    billingCity: { type: String, require: true },
    billingCountry: { type: String, require: true },
    billingPinCode: { type: Number, require: true },
    profilePic: { type: String, require: true },
    createdAt: Date,
    updatedAt: Date,
    status: { type: Boolean, default: 1 },
    deleteCustomer: { type: Boolean, default: 0 }
};
const customersSchema = new Schema(customers, { versionKey: false, timestamps: true });


// Manufacturers
const manufacturers = {
    _id: { type: objectId, auto: true },
    descriptions: { type: String, required: true },
    logo: { type: String, require: true },
    status: { type: Boolean, default: 1 }
};

const manufacturersSchema = new Schema(manufacturers, { versionKey: false });

const customerGroup = {
    _id: { type: objectId, auto: true},
    name: { type: String, required: true},
    expmtFromTax: { type: Boolean, default: 0 },
    status: { type: Boolean, default: 1 }
}
const customerGroupSchema = new Schema(customerGroup, {versionKey: false});

module.exports = {
    Vendor: mongoose.model("vendor", vendorSchema),
    Customers: mongoose.model("customers", customersSchema),
    Manufacturers: mongoose.model("manufacturers", manufacturersSchema),
    CustomerGroup: mongoose.model("customerGroup", customerGroupSchema)
};