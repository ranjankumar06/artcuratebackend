const express = require("express");
const app = express();

const admin = require("./admin/controller");
const user = require("./user/controller");
const userVerification = require("./userVerification/controller");

const companyProfile = require("./companyProfile/controller");
const currency = require("./currency/controller");
const faq = require("./faq/controller");
const order = require("./order/controller");
const product = require("./product/controller");
const gallery = require("./gallery/controller");
const event = require("./events/controller");
const review = require("./review/controller");
const timezone = require("./timezone/controller");
const uom = require("./uom/controller");
const wishlist = require("./wishlist/controller");
const contactsMaster = require("./contactsMaster/controller");
const bankDetail = require("./bankDetails/controller");
const wallet = require("./wallet/controller");
const shop = require("./shops/controller");
const plan = require("./plan/controller");

app.use("/admin", admin);
app.use("/user", user);
app.use("/userVerification", userVerification);
app.use("/companyProfile", companyProfile);
app.use("/currency", currency);
app.use("/faq", faq);
app.use("/product", product);
app.use("/gallery", gallery);
app.use("/event", event);
app.use("/review", review);
app.use("/timezone", timezone);
app.use("/uom", uom);
app.use("/wishlist", wishlist);
app.use("/contactsMaster", contactsMaster);
app.use("/bankDetails", bankDetail);
app.use("/wallet", wallet);
app.use("/shop", shop);
app.use("/plan", plan);

module.exports = app;
