const AWS = require('aws-sdk');
const stream = require('stream');
const isBase64 = require('is-base64');
const config = require('../helper/config');

const s3Client = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.REGION
});

const uploadParams = {
    Bucket: config.Bucket,
    // Key: 'user', // pass key
    Key: '', // pass key
    Body: null, // pass file body
    ContentType: 'image/png'
};

// const rename = ()

const upload = {
    uploadImage: (req, res, next) => {
        const client = s3Client;
        const params = uploadParams;
        
        params.Key = req.file.originalname;
        params.Body = req.file.buffer;
            
        client.upload(params, (err, data) => {
        	if (err) {
        		res.status(500).json({error:"Error -> " + err});
        	}
            console.log(data);
        	next();
        });
    },
    uploadProductImage: (req, res, next) => {
        const client = s3Client;
        const params = uploadParams;
        
        params.Key = req.file.originalname;
        params.Body = req.file.buffer;
            
        client.upload(params, (err, data) => {
        	if (err) {
        		res.status(500).json({error:"Error -> " + err});
        	}
        	res.json('Product Image uploaded successfully');
        });
    },
    uploadGalleryImage: (req, res, next) => {
        const client = s3Client;
        const params = uploadParams;
        
        params.Key = req.file.originalname;
        params.Body = req.file.buffer;
            
        client.upload(params, (err, data) => {
        	if (err) {
        		res.status(500).json({error:"Error -> " + err});
        	}
        	res.json('Gallery Image uploaded successfully');
        });
    },
    uploadEventImage: (req, res, next) => {
        const client = s3Client;
        const params = uploadParams;
        
        params.Key = req.file.originalname;
        params.Body = req.file.buffer;
            
        client.upload(params, (err, data) => {
        	if (err) {
        		res.status(500).json({error:"Error -> " + err});
        	}
        	res.json('Event Image uploaded successfully');
        });
    },
    uploadBannerImage: (req, res, next) => {
        const client = s3Client;
        const params = uploadParams;
        
        params.Key = req.file.originalname;
        params.Body = req.file.buffer;
            
        client.upload(params, (err, data) => {
        	if (err) {
        		res.status(500).json({error:"Error -> " + err});
        	}
            console.log(data);
        	next();
        });
    },
    productImage: (req, res, next) => {
        
        const client = s3Client;
        const params = uploadParams;
        const file = req.body.ProductImage;
      
        buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
        params.Key = `productImages-${Date.now()}.png`,
        params.Body = buf;
            
        client.upload(params, (err, data) => {
        	if (err) {
        		res.status(500).json({error:"Error -> " + err});
        	}
             console.log(`111-data-${JSON.stringify(data)}`);
             
            var location = data.Location
            
        	next(location);
           
          
        });
    }
}


module.exports = upload;