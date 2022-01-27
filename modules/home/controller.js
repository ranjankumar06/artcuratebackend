const express = require('express');
const multer = require('multer');

const Home = require('./models');
const uploadMiddleware = require('../../middleware/uploadImage');

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    Home.Banner.find((err, data) => {
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


router.post('/uploadPics', upload.single("profile"), uploadMiddleware.uploadBannerImage, (req, res) => {
    let obj = {
        userId: req.params.id,
        profilePics: req.file.originalname
    }
    let model = new Home.Banner(obj);
    model.save((err, banner) => {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).json('Banner Upload Successfully');
        }
    });
});

module.exports = router;