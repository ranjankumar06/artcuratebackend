const express = require('express');

const BankDetails = require('./models');

const router = express.Router();

router.get('/company', (req, res) => {
    BankDetails.find({ bankUserType: 'Company' }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                data: data
            });
        }
    });
});

router.get('/getAllVendors', (req, res) => {
    BankDetails.find({ bankUserType: 'Vendor' }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                data: data
            });
        }
    });
});


/* 
{
    "bankUserId": "609ab05eabddac700c9e5420",
    "bankUserType": "Vendor",
    "accountName": "Swarup Saha",
    "accountNumber": 1002059312,
    "bankCode": 1000004,
    "bankName": "HDFC",
    "branchName": "1st Block, Koramangala",
    "IFSCCode": "HDFC000004",
    "currency": "INR",
    "accountType": "Savings",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "pinCode": 560034,
}
*/
router.post('/addBankDetails', (req, res) => {
    let model = new BankDetails(req.body);
    model.save((err, bank) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Added Bank Details'
            });
        }
    });
});

module.exports = router;