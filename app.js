require('dotenv').config()
const mongoose = require("mongoose");

const currency = require('./middleware/currency');

// 'mongodb://localhost/artcurate'
mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log("Database has Connected");
}).catch(err => {
    console.log("Error : " + err);
});

currency();
setInterval(() => {
    console.log(new Date());
    currency();
}, 86400000);