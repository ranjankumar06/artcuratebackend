const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;


const Shopdetails = new Schema({
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true, ref: "user" },
    shopname: { type: String, },
    shoptype: { type: String, },
    shoptag: { type: String,},
    contectname: { type: String,  },
    designation: { type: String,  },
    email: { type: String,},
    contecnumber: { type: String, },
    altnumber: { type: String, },
    pencard: { type: String,  },
    adharnumber: { type: String,  },
    createdAt : { type: Date, required: true, default: Date.now },
    updatedAt : { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model("Shopdetails", Shopdetails);
// 