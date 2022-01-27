const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');

const config = require('../../helper/config');
const settings = require('./models');
const UserMiddleware = require("../../middleware/user");

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

let multipleUpload = multer({ storage: storage }).array('productImages');

const s3Client = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.REGION
});