const express = require('express');
const ObjectId = require("mongoose").Types.ObjectId;

const wishlist = require('./models');

const router = express.Router();

// Get all wishlist Based on User Id
router.get('/getWishlist/:userId', (req, res) => {
    const userId = req.params.userId;
    wishlist.aggregate([{
        $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
        }
    }, 
    { $unwind: '$product' },
    { $unset: 'productId' },
    {
        $match: {
            userId: ObjectId(userId)
        }
    }]).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(400).send(err);
    });
});

// Get Caregory wise wishlist Based on User Id
router.get('/getWishlist/:filter/:userId', (req, res) => {
    const userId = req.params.userId;
    const filter = req.params.filter;

    wishlist.aggregate([{
        $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
        }
    }, 
    { $unwind: '$product' },
    { $unset: 'productId' },
    {
        $match: {
            userId: ObjectId(userId),
            'product.category': filter
        }
    }]).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(400).send(err);
    });
});

/* 
{
    "userId": "609ab05eabddac700c9e5420",
    "productId": "609961b081f2da5ce0a67dcf"
}
*/
router.post('/addWishlist', (req, res) => {
    let model = new wishlist(req.body);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Product Has Been Added To The WishList'
            });
        }
    });
});

router.delete('/deleteWishlist/:id', (req, res) => {
    const id = req.params.id;
    wishlist.findByIdAndDelete(id, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json("Product Has Been Removed From The WishList");
        }
    });
});

module.exports = router;