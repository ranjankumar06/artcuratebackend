let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let objectId = Schema.ObjectId;

let orders = {};
let order = {
    _id: { type: objectId, auto: true },
    username: { type: String, required: true },
    orderTime: Date,
    contactNo: { type: Number, required: true },
    deliverAddress: { type: String, required: true },
    email: { type: String, require: true },
    expectedDeliverDate: { type: Date, require: true },
    paidStatus: { type: Boolean, default: 0 },
    deliveryStatus: { type: Boolean, default: 0 }
}
let orderSchema = new Schema(order, { versionKey: false });

orderSchema.pre('save', function(next) {
	// get the current date
	let currentDate = new Date();
	// if created_at doesn't exist, add to that field
    if (!this.orderTime){
        this.orderTime = currentDate;
    }
    next();
});
orders.orderInfo = mongoose.model("order", orderSchema);

let orderDetails = {
    _id: { type: objectId, auto: true },
    username: { type: String, required: true },
    orderTime: Date,
    contactNo: { type: Number, required: true },
    deliverAddress: { type: String, required: true },
    email: { type: String, require: true },
    expectedDeliverDate: { type: Date, require: true },
    paidStatus: { type: Boolean, default: 0 },
    deliveryStatus: { type: Boolean, default: 0 }
}
let orderDetailsSchema = new Schema(orderDetails, { versionKey: false });
orders.orderDetails = mongoose.model("orderDetails", orderDetailsSchema);

module.exports = orders;