const express = require("express");
const multer = require("multer");

const Product = require("./models");
const productMiddleware = require("../../middleware/product");
const userMiddleware = require("../../middleware/user");
const uploadMiddleware = require("../../middleware/uploadImage");
const _ = require("lodash");
const adminModel = require("../admin/models");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


/**
 * Get Showcase Type
 * userMiddleware.verifyToken
 */
router.get('/getShowcaseType', async (req,res) =>{

  await adminModel.ShowcaseType.find({}, (err, data) => {

    if (err || !data) {
      res.status(400).send(err);
    } else {

      if(data) {

        let showcaseType;

        data.map((showcase) => {
          showcaseType = showcase.showcaseType;
        });

        if(showcaseType) {

          res.status(200).json({
            success: true,
            showcaseType
          });
        }
      } else {

        res.status(400).send({
          success: false,
          message: "Oops! Something Went Wrong."
        });
      }
    }
  });
});

/**
 * Get Showcase Category
 * userMiddleware.verifyToken
 */
router.get('/getShowcaseMain', async (req,res) =>{

  await adminModel.ShowcaseCategory.find({}, (err, data) => {

    if (err || !data) {
      throw err;
    } else {

      if(data) {

        res.json({
          success: true,
          showcaseMain: data.map(item => ( item["showcaseMain"] ))
        });

      } else {

        res.status(400).send({
          success: false,
          message: "Oops! Something Went Wrong."
        });
      }
    }
  });
});

router.get('/getShowcaseDetails/:showcaseMain', async (req, res) => {

    const showcaseMain = (req.params.showcaseMain).split(' ').map(_.capitalize).join(' ');

    await adminModel.ShowcaseCategory.aggregate([
        {
            $match: { showcaseMain }
        },
        {
            $project: {
                _id: 0,
                createdAt: 0,
                updatedAt: 0
            }
        }
    ], (err, data) => {

        if(err || !data) {
            throw err;
        } else {
            if(data.length !== 0) {
                res.status(200).json({
                    success: true,
                    data: data[0]
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "Showcase Category Not Found!"
                });
            }
        }
    });
});

router.get("/getAllProduct", (req, res) => {
  Product.Category.aggregate([
    {
      $lookup: {
        from: "feedbacks",
        localField: "_id",
        foreignField: "productId",
        as: "feedback",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "collab",
        foreignField: "_id",
        as: "collab",
      },
    },
    {
      $project: {
        _id: "$_id",
        userId: "$userId",
        fname: "$user.fname",
        lname: "$user.lname",
        collab: "$collab",
        productName: "$productName",
        category: "$category",
        subCategory: "$subCategory",
        productType: "$productType",
        location: "$location",
        size: "$size",
        price: "$price",
        color: "$color",
        rarity: "$rarity",
        waysToBuy: "$waysToBuy",
        buyFrom: "$buyFrom",
        productImage: "$productImage",
        createdDate: "$createdDate",
        status: "$status",
        feedback: {
          $cond: {
            if: { $eq: [{ $size: "$feedback" }, 0] },
            then: [{}],
            else: "$feedback",
          },
        },
      },
    },
    { $unwind: "$feedback" },
    { $unwind: "$fname" },
    { $unwind: "$lname" },
    {
      $group: {
        _id: "$_id",
        userId: { $first: "$userId" },
        fname: { $first: "$fname" },
        lname: { $first: "$lname" },
        collab: { $first: "$collab" },
        productName: { $first: "$productName" },
        category: { $first: "$category" },
        subCategory: { $first: "$subCategory" },
        productType: { $first: "$productType" },
        location: { $first: "$location" },
        size: { $first: "$size" },
        price: { $first: "$price" },
        color: { $first: "$color" },
        rarity: { $first: "$rarity" },
        waysToBuy: { $first: "$waysToBuy" },
        buyFrom: { $first: "$buyFrom" },
        productImage: { $first: "$productImage" },
        like: {
          $sum: { $cond: ["$feedback.like", 1, 0] },
        },
        share: {
          $sum: { $cond: ["$feedback.share", 1, 0] },
        },
        createdDate: {
          $first: "$createdDate",
        },
        status: {
          $first: "$status",
        },
      },
    },
    {
      $unset: [
        "collab.password",
        "collab.emailVerified",
        "collab.phoneVerified",
        "collab.status",
        "collab.role",
        "collab.email",
        "collab.phone",
        "collab.countryCode",
        "collab.updatedDate",
        "collab.createdDate",
        "collab.securityCode",
      ],
    },
  ])
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.get("/getProduct", (req, res) => {
  const filter = req.query;
  Product.Category.aggregate([
    {
      $lookup: {
        from: "feedbacks",
        localField: "_id",
        foreignField: "productId",
        as: "feedback",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "collab",
        foreignField: "_id",
        as: "collab",
      },
    },
    {
      $project: {
        _id: "$_id",
        userId: "$userId",
        fname: "$user.fname",
        lname: "$user.lname",
        collab: "$collab",
        productName: "$productName",
        category: "$category",
        subCategory: "$subCategory",
        productType: "$productType",
        location: "$location",
        size: "$size",
        price: "$price",
        color: "$color",
        rarity: "$rarity",
        waysToBuy: "$waysToBuy",
        buyFrom: "$buyFrom",
        productImage: "$productImage",
        createdDate: "$createdDate",
        status: "$status",
        feedback: {
          $cond: {
            if: { $eq: [{ $size: "$feedback" }, 0] },
            then: [{}],
            else: "$feedback",
          },
        },
      },
    },
    { $unwind: "$feedback" },
    { $unwind: "$fname" },
    { $unwind: "$lname" },
    {
      $group: {
        _id: "$_id",
        userId: { $first: "$userId" },
        fname: { $first: "$fname" },
        lname: { $first: "$lname" },
        collab: { $first: "$collab" },
        productName: { $first: "$productName" },
        category: { $first: "$category" },
        subCategory: { $first: "$subCategory" },
        productType: { $first: "$productType" },
        location: { $first: "$location" },
        size: { $first: "$size" },
        price: { $first: "$price" },
        color: { $first: "$color" },
        rarity: { $first: "$rarity" },
        waysToBuy: { $first: "$waysToBuy" },
        buyFrom: { $first: "$buyFrom" },
        productImage: { $first: "$productImage" },
        like: {
          $sum: { $cond: ["$feedback.like", 1, 0] },
        },
        share: {
          $sum: { $cond: ["$feedback.share", 1, 0] },
        },
        createdDate: {
          $first: "$createdDate",
        },
        status: {
          $first: "$status",
        },
      },
    },
    {
      $unset: [
        "collab.password",
        "collab.emailVerified",
        "collab.phoneVerified",
        "collab.status",
        "collab.role",
        "collab.email",
        "collab.phone",
        "collab.countryCode",
        "collab.updatedDate",
        "collab.createdDate",
        "collab.securityCode",
      ],
    },
    {
      $match: filter,
    },
  ])
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

/* 
{
    "userId": "609ab05eabddac700c9e5420",
    "collab": "609ab05eabddac700c9e5420",
    "productName": "The Abstract Ocean Bubble 100% Hand Painted Wall Painting (With Outer Floater frame)",
    "category": "Art",
    "subCategory": "Prints",
    "productType": "Photography",
    "stock": 1,
    "price": 7999.00,
    "discPrice": 7100,
    "quantity": 1,
    "size": {
        "height": "36 Inches",
        "weidth": "48 Inches",
        "depth": "5 Inches"
    },
    "color": "Deep Blue",
    "rarity": "Limited Edition",
    "waysToBuy": "Buy Now",
    "buyFrom": "Artists"
}
*/

router.post("/addProduct", (req, res) => {
  let model = new Product.Category(req.body.category)

  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
        req.body.details.productId = data._id
      let model = new Product.Details(req.body.details);
      model.save((err, details) => {
        if (err) {
          res.status(400).send(err.message);
        } else {
          res.status(200).json({
            success: true,
            category: data,
            details: details,
            message: "Product Details Has Been Added Successfully",
          });
        }
      });
    //   res.status(200).json(data);
    }
  });
});

router.put("/updateProduct/:id", (req, res) => {
  const id = req.params.id;
  const body = req.body;
  Product.Category.findOneAndUpdate({ _id: id }, body, (err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json(data);
    }
  });
});

router.delete(
  "/deleteProduct/:id",
  productMiddleware.deleteProductDetails,
  productMiddleware.deleteProductReview,
  (req, res) => {
    const id = req.params.id;
    Product.Category.findOneAndDelete({ _id: id }, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json(data);
      }
    });
  }
);

// Product Details
router.get("/productDetails/:id", (req, res) => {
  const productId = req.params.id;
  Product.Details.find({ productId: productId }, (err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        success: true,
        data: data,
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
router.post("/addProductDetails", userMiddleware.verifyToken, (req, res) => {
  let model = new Product.Details(req.body);
  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        success: true,
        message: "Product Details Has Been Added Successfully",
      });
    }
  });
});

router.put(
  "/updateProductDetails/:id",
  userMiddleware.verifyToken,
  (req, res) => {
    const id = req.params.id;
    const body = req.body;
    Product.Details.findOneAndUpdate({ _id: id }, body, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json(data);
      }
    });
  }
);

router.post(
  "/addProductImage",
  userMiddleware.verifyToken,
  upload.single("product"),
  uploadMiddleware.uploadProductImage
);

router.post("/uploadProductImage", userMiddleware.verifyToken, (req, res) => {
  let model = new Product.Image(req.body);
  model.save((err, profile) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json("Product Image Has Been Uploaded Successfully");
    }
  });
});

router.get("/getVariant", (req, res) => {
  Product.Variant.findOne((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json(data);
    }
  });
});

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
router.post("/addVariant", userMiddleware.verifyToken, (req, res) => {
  const obj = req.body;
  obj.fieldName = "ProductVarient";
  obj.updatedDate = new Date();

  Product.Variant.findOneAndUpdate(
    { fieldName: "ProductVarient" },
    obj,
    {
      new: true,
      upsert: true, // Make this update into an upsert
    },
    (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json(data);
      }
    }
  );
});

// router.put('/updateVariant/:id', (req, res) => {
//     const id = req.params.id;
//     const body = req.body;
//     Product.Variant.findOneAndUpdate({ _id: id }, body, (err, data) => {
//         if (err) {
//             res.send(err.message);
//         } else {
//             res.json(data);
//         }
//     });
// });

module.exports = router;
