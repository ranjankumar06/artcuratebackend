const express = require('express');

const Timezone = require('./models');

const router = express.Router();

router.get('/', (req, res) => {
    Timezone.find((err, data) => {
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


router.post('/addTimezone', (req, res) => {
    let model = new Timezone(req.body);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Timezone Has Been Added Successfully'
            });
        }
    });
});

module.exports = router;