const express = require('express');
const ObjectId = require("mongoose").Types.ObjectId;

const Product = require('../product/models');
const UserFeed = require('./models');

const router = express.Router();

// Get all wishlist Based on User Id
router.get('/getProductByUser/:userId', (req, res) => {
    const userId = req.params.userId;
    Product.Category.aggregate([
        {
            $match: {
                userId: ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'feedbacks',
                localField: '_id',
                foreignField: 'productId',
                as: 'feedback'
            }
        }, {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
            }
        }, {
            $lookup: {
                from: 'users',
                localField: 'collab',
                foreignField: '_id',
                as: 'collab'
            }
        }, {
            $project: {
                _id: '$_id',
                userId: '$userId',
                fname: '$user.fname',
                lname: '$user.lname',
                collab: '$collab',
                productName: '$productName',
                category: '$category',
                subCategory: '$subCategory',
                productType: '$productType',
                location: '$location',
                size: '$size',
                price: '$price',
                color: '$color',
                rarity: '$rarity',
                waysToBuy: '$waysToBuy',
                buyFrom: '$buyFrom',
                productImage: '$productImage',
                createdDate: '$createdDate',
                status: '$status',
                feedback: {
                    $cond: {
                        if: { $eq: [{ $size: '$feedback' }, 0] },
                        then: [{}],
                        else: '$feedback'
                    }
                }
            }
        },
        { $unwind: '$feedback' },
        { $unwind: '$fname' },
        { $unwind: '$lname' },
        {
            $group: {
                _id: '$_id',
                userId: { $first: '$userId' },
                fname: { $first: '$fname' },
                lname: { $first: '$lname' },
                collab: { $first: '$collab' },
                productName: { $first: '$productName' },
                category: { $first: '$category' },
                subCategory: { $first: '$subCategory' },
                productType: { $first: '$productType' },
                location: { $first: '$location' },
                size: { $first: '$size' },
                price: { $first: '$price' },
                color: { $first: '$color' },
                rarity: { $first: '$rarity' },
                waysToBuy: { $first: '$waysToBuy' },
                buyFrom: { $first: '$buyFrom' },
                productImage: { $first: '$productImage' },
                like: {
                    $sum: { $cond: ['$feedback.like', 1, 0] }
                },
                share: {
                    $sum: { $cond: ['$feedback.share', 1, 0] }
                },
                createdDate: {
                    $first: '$createdDate'
                },
                status: {
                    $first: '$status'
                }
            }
        }, {
            $unset: ['collab.password', 'collab.emailVerified', 'collab.phoneVerified', 'collab.status', 'collab.role',
                'collab.email', 'collab.phone', 'collab.countryCode', 'collab.updatedDate', 'collab.createdDate', 'collab.securityCode'
            ]
        }
    ]).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(400).json(err);
    });
});


router.get('/getUserFeed/:userId', (req, res) => {
    const userId = req.params.userId;
    UserFeed.aggregate([{
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
    console.log("Get Wishlist Call");
    console.log(filter);

    UserFeed.aggregate([{
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
    let model = new UserFeed(req.body);
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
    UserFeed.findByIdAndDelete(id, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json("Product Has Been Removed From The WishList");
        }
    });
});

module.exports = router;