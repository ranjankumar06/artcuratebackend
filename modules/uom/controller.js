const express = require('express');

const Uom = require('./models');

const router = express.Router();

router.get('/', (req, res) => {
    Uom.find((err, data) => {
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


router.post('/addUom', (req, res) => {
    let model = new Uom(req.body);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'UOM Has Been Added Successfully'
            });
        }
    });
});

module.exports = router;