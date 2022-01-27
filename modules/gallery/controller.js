const express = require('express');
const multer = require('multer');

const Facility = require('./models');
const uploadMiddleware = require('../../middleware/uploadImage');
const userMiddleware = require('../../middleware/user')

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

function setTime(date, time) {
    let dates = new Date(date)
    const hours = time.slice(0, 2);
    const minutes = time.slice(3);
    dates.setHours(hours, minutes);
    return dates;
}

router.get('/getAllGallery', (req, res) => {
    Facility.Gallery.aggregate([
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

router.get('/getGallery', (req, res) => {
    const filter = req.query;
    Facility.Gallery.aggregate([
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
        }, {
            $match: filter
        }
    ]).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(400).json(err);
    });
});


/* 
{
    "ownerId": "609ab05eabddac700c9e5420",
    "collab": [
        "60af43eb7babcbf4d63418a2", 
        "609ab05eabddac700c9e5420"
    ],
    "galleryName": "Atta Galatta",
    "openDay": ["Monday", "Wednessday", "Friday"],
    "bookingStartTime": "06:00",
    "bookingEndTime": "09:30",
    "price": 5000,
    "duration": "Hours",
    "location": "134, 17th H Main Rd, KHB Colony, 5th Block, Koramangala, Bengaluru, Karnataka 560095",
    "locationUrl": "https://goo.gl/maps/ESE4Cz7i3anEvEZ2A",
}
*/
router.post('/addGallery', userMiddleware.verifyToken, (req, res) => {
    let obj = req.body;
    const date = new Date(obj.bookingDay);
    // obj.bookingDay = date; 
    obj.bookingStartTime = setTime(date, obj.bookingStartTime);
    obj.bookingEndTime = setTime(date, obj.bookingEndTime);

    let model = new Facility.Gallery(req.body);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Gallery Has Been Created Successfully'
            });
        }
    });
});

router.put('/updateGallery/:id', userMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;
    Facility.Gallery.findOneAndUpdate({ _id: id }, body, { timestamps: { createdAt:false, updatedAt:true } }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});

router.delete('/deleteGallery/:id', userMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    Facility.Gallery.findOneAndDelete({ _id: id }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});


// Product Details
router.get('/galleryDetails/:id', (req, res) => {
    const galleryId = req.params.id;
    Facility.GalleryDetails.find({ galleryId: galleryId }, (err, data) => {
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
    productId: 609946fdba377359532041ca,
    productDescription: "String"
}
*/
router.post('/addGalleryDetails', userMiddleware.verifyToken, (req, res) => {
    let model = new Facility.GalleryDetails(req.body);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Gallery Details Has Been Added Successfully'
            });
        }
    });
});

router.put('/updateGalleryDetails/:id', userMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;
    Facility.GalleryDetails.findOneAndUpdate({ _id: id }, body, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});

// router.post('/addGalleryImage', upload.single("product"), uploadMiddleware.uploadGalleryImage);

// router.post('/uploadGalleryImage', (req, res) => {
//     let model = new Product.Image(req.body);
//     model.save((err, profile) => {
//         if (err) {
//             res.send(err);
//         } else {
//             res.json('Product Images uploaded successfully into Database');
//         }
//     });
// });


// router.get('/getGalleryVariant', (req, res) => {
//     Product.Variant.findOne((err, data) => {
//         if (err) {
//             res.send(err.message);
//         } else {
//             res.json(data);
//         }
//     });
// });

/* {
    "colors": [{
        "color": "Blue",
        "code": "#0000FF"
    }, {
        "color": "Red",
        "code": "#FF0000"
    }],
    "size": ["Height", "Weidth", "Depth"],
    "shape": ["Triangle", "Rectangular", "Circle"],
    "pattern": ["Printed", "Canvas", "Oil Painting"],   // Finishing Type, Painting Type
    "type": ["Handmade", "Images"],
    "material": ["Acrylic", "Wood And Canvas"],
    "frame": ["Without Frame", "Wooden", "As per requirement"],
    "style": ["Modern", "Hanging", "Tabletop", "Floor"],
    "packingType": ["Box"]
}
*/
// router.post('/addGalleryVariant', (req, res) => {
//     const obj = req.body;
//     obj.fieldName = "ProductVarient";
//     obj.updatedDate = new Date();

//     Product.Variant.findOneAndUpdate({ fieldName: "ProductVarient" }, obj, {
//         new: true,
//         upsert: true // Make this update into an upsert
//     }, (err, data) => {
//         if (err) {
//             res.send(err.message);
//         } else {
//             res.json(data);
//         }
//     });
// });

module.exports = router;