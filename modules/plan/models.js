const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;


const plan = {
    _id: { type: objectId, auto: true },
    planName: {type: String, required: [true, "Plan name is required"]},
    amount: {type: Number, required: [true, "Amount is required"]},
    createdAt: Date,
    updatedAt: Date
};

const planDetailsSchema = new Schema(plan, { versionKey: false, timestamps: true });


module.exports = {
    Details: mongoose.model("plan", planDetailsSchema),
};