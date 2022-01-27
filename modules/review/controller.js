const express = require('express');
const ObjectId = require("mongoose").Types.ObjectId;

const Review = require('./models');
const userMiddleware = require('../../middleware/user');

const router = express.Router();

// Product
router.get('/product/allReview/:productId', (req, res) => {
    const productId = req.params.productId;

    Review.ProductComment.aggregate([{
        $match: {
            productId: ObjectId(productId),
        }
    }, {
        $project: {
            like: {
                $size: {
                    $filter: {
                        'input': "$reply",
                        'as': 'el',
                        'cond': {
                            $eq: ['$$el.like', true]
                        }
                    }
                }
            },
            fname: '$fname',
            lname: '$lname',
            status: '$status',
            productId: '$productId',
            userId: '$userId',
            role: '$role',
            rating: '$rating',
            comment: '$comment',
            reviewDate: '$reviewDate',
            reply: '$reply'
        }
    }]).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(400).json(err);
    });
});

/* 
{
    "productId": "609976e781f2da5ce0a67dd2",
    "userId": "609976e781f2da5ce0a67dd2",
    "productType": "Photography",
    "rating": 5,
    "reviewHeading": "Awesome Product",
    "review": "This just made our living room fantastic. Goes well with the Hand-Painted Wall Painting.",
    "reviewImage": ["The Abstract Ocean Bubble 1.jpg", "The Abstract Ocean Bubble 2.jpg"],
    "reviewerName": "Swarup Saha",
    "reviewerEmail": "swarup.saha004@hotmail.com"
};
*/
router.post('/product/addReview', userMiddleware.verifyToken, (req, res) => {
    let obj = req.body;
    obj.commentStatus = (obj.comment.length > 0) ? 1 : 0;
    let model = new Review.ProductComment(obj);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Review Added For The Product'
            });
        }
    });
});

/**
 * {
 *      "userId": objectId,
        "fname": "Swarup",
        "lname": "Saha",
        "reviewerEmail": "swarup.saha004@hotmail.com",
        "comment": String,
        "like": true,
        "replyDate": Date,
 * }
 */
router.post('/product/addReply/:id', userMiddleware.verifyToken, (req, res) => {
    const reviewId = req.params.id;
    const obj = req.body;
    // obj.like = (obj.like === true) ? 1 : 0;
    obj.commentStatus = (obj.comment.length > 0) ? 1 : 0;
    obj.replyDate = new Date();

    Review.ProductComment.findOneAndUpdate({ _id: reviewId }, { $push: { reply: obj } }, {
        new: true,
        upsert: true // Make this update into an upsert
    }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'User Has Replied For The Review'
            });
        }
    });
});

// Get Like & Share count based on Product ID
router.get('/product/getFeedback/:productId', (req, res) => {
    const productId = req.params.productId;
    Review.ProductFeedback.aggregate([{
        $match: {
            productId: ObjectId(productId)
        }
    }, {
        $group: {
            _id: ObjectId(productId),
            like: { $sum: { $cond: ["$like", 1, 0] } },
            share: { $sum: { $cond: ["$share", 1, 0] } }
        }
    }]).then(data => {
        res.status(400).json(data);
    }).catch(err => {
        res.status(200).send(err);
    });
});

// Add Like & Share Functionality
router.post('/product/addFeedback', userMiddleware.verifyToken, (req, res) => {
    const productId = req.body.productId;
    const userId = req.body.userId;
    const obj = req.body
    obj.feedbackDate = new Date();

    Review.ProductFeedback.findOneAndUpdate({ productId: productId, userId: userId }, obj, {
        new: true,
        upsert: true // Make this update into an upsert
    }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Feedback Added For The Product'
            });
        }
    });
});


// Gallery
router.get('/gallery/allReview/:galleryId', (req, res) => {
    const galleryId = req.params.galleryId;
    Review.GalleryComment.aggregate([{
        $match: {
            galleryId: ObjectId(galleryId)
        }
    }, {
        $project: {
            like: {
                $size: {
                    $filter: {
                        'input': "$reply",
                        'as': 'el',
                        'cond': {
                            $eq: ['$$el.like', true]
                        }
                    }
                }
            },
            fname: '$fname',
            lname: '$lname',
            status: '$status',
            galleryId: '$galleryId',
            userId: '$userId',
            role: '$role',
            rating: '$rating',
            comment: '$comment',
            reviewDate: '$reviewDate',
            reply: '$reply'
        }
    }]).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(400).json(err);
    });
});

/* 
{
    "productId": "609976e781f2da5ce0a67dd2",
    "userId": "609976e781f2da5ce0a67dd2",
    "productType": "Photography",
    "rating": 5,
    "reviewHeading": "Awesome Product",
    "review": "This just made our living room fantastic. Goes well with the Hand-Painted Wall Painting.",
    "reviewImage": ["The Abstract Ocean Bubble 1.jpg", "The Abstract Ocean Bubble 2.jpg"],
    "reviewerName": "Swarup Saha",
    "reviewerEmail": "swarup.saha004@hotmail.com"
};
*/
router.post('/gallery/addReview', userMiddleware.verifyToken, (req, res) => {
    const obj = req.body;
    obj.commentStatus = (obj.comment.length > 0) ? 1 : 0;
    let model = new Review.GalleryComment(req.body);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Review Added For The Product'
            });
        }
    });
});

/**
 * {
 *      "userId": objectId,
        "fname": "Swarup",
        "lname": "Saha",
        "like": true
 * }
 */
router.post('/gallery/addReply/:id', userMiddleware.verifyToken, (req, res) => {
    const reviewId = req.params.id;
    const obj = req.body;
    // obj.like = (obj.like === true) ? 1 : 0;
    obj.replyDate = new Date();

    Review.GalleryComment.findOneAndUpdate({ _id: reviewId }, { $push: { reply: obj } }, {
        new: true,
        upsert: true // Make this update into an upsert
    }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'User Has Replied For The Review'
            });
        }
    });
});

// Get Like & Share count based on Product ID
router.get('/gallery/getFeedback/:galleryId', (req, res) => {
    const galleryId = req.params.galleryId;
    Review.GalleryFeedback.aggregate([{
        $match: {
            galleryId: ObjectId(galleryId)
        }
    }, {
        $group: {
            _id: ObjectId(galleryId),
            like: { $sum: { $cond: ["$like", 1, 0] } },
            share: { $sum: { $cond: ["$share", 1, 0] } }
        }
    }]).then(data => {
        res.status(200).json(data[0]);
    }).catch(err => {
        res.status(400).send(err);
    });
});

// Add Like & Share Functionality
router.post('/gallery/addFeedback', userMiddleware.verifyToken, (req, res) => {
    const galleryId = req.body.galleryId;
    const userId = req.body.userId;
    const obj = req.body
    obj.feedbackDate = new Date();

    Review.GalleryFeedback.findOneAndUpdate({ galleryId: galleryId, userId: userId }, obj, {
        new: true,
        upsert: true // Make this update into an upsert
    }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Feedback Added For The Gallery'
            });
        }
    });
});

module.exports = router;