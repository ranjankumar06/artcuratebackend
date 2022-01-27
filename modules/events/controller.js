const express = require('express');
const multer = require('multer');

const Event = require('./models');
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

router.get('/getAllEvent', (req, res) => {
    Event.Category.aggregate([
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

router.get('/getEvent', (req, res) => {
    const filter = req.query;
    Event.Category.aggregate([
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

router.post('/addEvent', (req, res) => {
    let obj = req.body;
    const date = new Date(obj.bookingDay);
    // obj.bookingDay = date; 
    obj.bookingStartTime = setTime(date, obj.bookingStartTime);
    obj.bookingEndTime = setTime(date, obj.bookingEndTime);

    let model = new Event.Category(req.body);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'New Event Has Been Created'
            });
        }
    });
});

router.put('/updateEvent/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;
    Event.Category.findOneAndUpdate({ _id: id }, body, { timestamps: { createdAt:false, updatedAt:true } }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});

router.delete('/deleteEvent/:id', (req, res) => {
    const id = req.params.id;
    Event.Category.findOneAndDelete({ _id: id }, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});


// Product Details
router.get('/eventDetails/:id', (req, res) => {
    const eventId = req.params.id;
    Event.Details.find({ eventId: eventId }, (err, data) => {
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
router.post('/addEventDetails', (req, res) => {
    let model = new Event.Details(req.body);
    model.save((err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: 'Event Details Has Been Added'
            });
        }
    });
});

router.put('/updateEventDetails/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;
    Event.Details.findOneAndUpdate({ _id: id }, body, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            res.status(200).json(data);
        }
    });
});

// router.post('/addEventImage', upload.single("product"), uploadMiddleware.uploadEventImage);

// router.post('/uploadEventImage', (req, res) => {
//     let model = new Event.Image(req.body);
//     model.save((err, profile) => {
//         if (err) {
//             res.send(err);
//         } else {
//             res.json('Event Images uploaded successfully into Database');
//         }
//     });
// });


module.exports = router;