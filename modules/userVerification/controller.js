const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const QRCode = require('qrcode');

const config = require('../../helper/config');
const settings = require('./models');
const UserMiddleware = require("../../middleware/user");
const uploadMiddleware = require('../../middleware/uploadImage');
const email = require('../../middleware/email');

const client = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
const router = express.Router();

let storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '');
    }
});

let multipleUpload = multer({ storage: storage }).array('document');

const s3Client = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.REGION
});

router.post('/verification', multipleUpload, UserMiddleware.checkExistingUserVerificationId, async (req, res) => {

    const file = req.body.document;
    
    for( i = 0; i < file.length; i++ ) {

        buf = Buffer.from(file[i].replace(/^data:image\/\w+;base64,/, ""),'base64');

        var params = {
            Bucket: `${config.DocumentsBucket}/${req.body.userId}`,
            Key: `userId-${req.body.userId}-${Date.now()}.png`,
            Body: buf,
            ContentType: 'image/png'
        }

        var ResponseData = [];

        s3Client.upload(params, function (err, data) {
            if (err || !data) {
                res.status(400).send(err.message);
            } else {
                ResponseData.push(data.Location);
                console.log(ResponseData);
                if( ResponseData.length === file.length ) {
                    let obj = {
                        userId: req.body.userId,
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        knownAs: req.body.knownAs,
                        category: req.body.category,
                        subCategory: req.body.subCategory,
                        POI: req.body.POI,
                        idNumber: req.body.idNumber,
                        document: ResponseData,
                        isCurator: req.body.isCurator,
                    }
                    let model = new settings.Verification(obj);
                    model.save(( err, profile ) => {
                        if (err) {
                            res.send(err);
                        } else {
                            const url = 'localhost:3000/user/forgotpassword?id=' + profile._id;
                            const resetUrlTemplate = "Reset url is <a href='" + url + "'>" + url + "</a>";

                            email(config.adminEmailID, 'Reset Url',"varification check", "adminTamplate",{resetUrlTemplate});
                            let regText = "Verification Success";
                              if(req.body.email){
                                email(
                                    profile.email,
                                    "Verification Sent to Admin Team",
                                    regText,
                                    "accountVerification",
                                    {}
                                );
                            }else{
                                userPhone = `+${profile.phone}`;
                                client.messages
                                    .create({
                                        body: `Hi ${profile.name}Your account is under Verification.`,
                                        messagingServiceSid: process.env.MSGSSID,
                                        to: userPhone,
                                    })
                                    .then((messages) => console.log(messages))
                                    .catch((err) => console.error(err));
                            }

                            res.json({
                                success: true,
                                message: "File Uploaded Successfully",
                                Data: profile
                            });
                        }
                    });
                }
            }
        });
    }
});

router.get('/getVerification/:userId',async (req, res) => {

    const userId = req.params.userId;

    try {
        const result = await settings.Verification.findOne({ userId },{ _id:0, createdAt:0, updatedAt:0, userId:0 });
        if(!result){
            res.status(200).json({
                success: false,
                message: "No data found!!"
            });
        }
        else{
            res.status(200).json({
                success: true,
                data: result
            });
        }
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.post('/adminVerification', (req, res) => {

    const options = { upsert : true, new : true, setDefaultsOnInsert : true, timestamps: { createdAt: false, updatedAt: false, verificationDate: false, IsRejectDate: true }};
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { isVerified : req.body.isVerified };
    const resRejectData = { isReject : req.body.isReject, isRejectDate : new Date() };

    if (req.body.isVerified) {

        settings.Verification.findOneAndUpdate(resSettingFilter, resSettingData, options,(error,result)=>{
            if (err) {
                res.status(500).send(err);
            } else {
                let regText = "Verification Success!";

                email(
                    result.username,
                    "Verification Done Successfully!",
                    regText,
                    "accountVerificationSuccess",
                    {name: `${result.name}`, username: `${result.username}` }
                );
                res.status(200).json({
                    success: true
                });
            }
        });
    } else if (req.body.isReject) {
        settings.Verification.findOneAndUpdate(resSettingFilter, resRejectData, options,(error,result)=>{
            if (error) {
                res.status(500).send(error);
            } else {
                let regText = "Verification Rejected!";

                email(
                    result.username,
                    "Verification Rejected",
                    regText,
                    "rejectVerification",
                    {name: `${result.name}`, RejectType: `${req.body.rejectData}` }
                );
                res.status(200).json({
                    success: true,
                    rejectDate: result.isRejectDate,
                    verificationDate: result.verificationDate
                });
            }
        });

    }
});

router.delete('/deleteVerification/:userId', (req, res) => {

    const userId = req.params.userId;

    settings.Verification.findOneAndDelete({userId}, (err, data) => {
        if (err) {
            res.status(400).send(err.message);
        } else {
            regText="Re-Verification Enabled";

            email(
                result.username,
                "Start Verification",
                regText,
                "accountVerification",
                {}
            );
            res.status(200).json({
                success: true,
                message: "Deleted Successfully!"
            });
        }
    });
});

router.get('/getQRcode',async (req, res) => {

    try {
        let data = await QRCode.toString('Hello From User');
        // console.log(data,{type:'terminal'});
        res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
