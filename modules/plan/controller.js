const express = require('express');
const ObjectId = require("mongoose").Types.ObjectId;
const Plan = require('./models');
const userMiddleware = require('../../middleware/user');

const router = express.Router();

router.get("/rentalPlans", (req, res) => {
    Plan.find({}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
});

router.post("/postPlans", (req, res) => {
    Plan.Details.insertMany([
        { planName: '1 month', amount: 2000 },
        { planName: '3 months', amount: 5000 },
        { planName: '6 months', amount: 7000 },
        { planName: '12 months', amount: 9000 }
    ]).then(function () {
        res.send("Data inserted");  // Success
    }).catch(function (error) {
        console.log(error)      // Failure
    });

});



module.exports = router;