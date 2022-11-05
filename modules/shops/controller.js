const express = require("express");
const ObjectId = require("mongoose").Types.ObjectId;
const Shop = require("../shops/models");
// const ShopAnnouce = require("../shops/models")
const userMiddleware = require("../../middleware/user");
const email = require("../../middleware/email");

const router = express.Router();

router.get("/check/:id", (req, res) => {
  Shop.Details.findOne({ userId: req.params.id }, (err, shop) => {
    if (err) {
      res.send(err);
    } else {
      if (!shop) {
        res.status(404).send("No shop Found");
      } else {
        res.send(shop);
      }
    }
  });
});
// Get shop info by Id
router.get("/info/:id", (req, res) => {
  const id = req.params.id;
  Shop.Details.aggregate([
    { $match: { userId: ObjectId(id) } },
    {
      $lookup: {
        from: "shopaddresses",
        localField: "_id",
        foreignField: "shopId",
        as: "address",
      },
    },
    {
      $lookup: {
        from: "shopaccounts",
        localField: "_id",
        foreignField: "shopId",
        as: "accounts",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "shopId",
        as: "subscriptions",
      },
    },
  ])
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// Create a shop
router.post("/create", userMiddleware.verifyToken, (req, res) => {
  let shopDetails = {
    shopName: req.body.shopName,
    userId: req.body.userId,
    shopType: req.body.shopType,
    panNumber: req.body.panNumber,
    taxNumber: req.body.taxNumber,
    gstIn: req.body.gstIn,
    email: req.body.email,
    phone: req.body.phone,
    pickup: req.body.pickup,
    contactName: req.body.contactName,
    designations: req.body.designations,
    altPhone: req.body.altPhone,
    tags: req.body.tags,
  };
  let shopDetailModel = new Shop.Details(shopDetails);

  shopDetailModel.save((err, shop) => {
    if (err) {
      res.send(err);
    } else {
      if (shop) {
        let bankAccounts = {
          shopId: shop._id,
          accountName: req.body.accountName,
          accountBranch: req.body.accountBranch,
          accountNumber: req.body.accountNumber,
          ifsc: req.body.ifsc,
          upi: req.body.upi,
          swiftCode: req.body.swiftCode,
        };
        // let shopSubscriptions = {
        //     "shopId": shop._id,
        //     "plan": req.body.plan,
        //     "planType": req.body.planType,
        //     "validFrom": req.body.validFrom,
        //     "vaidTill": req.body.vaidTill,
        // }

        let shopAccountModel = new Shop.Accounts(bankAccounts);
        // let shopSubscriptionsModel = new Shop.Subscriptions(shopSubscriptions);
        shopAccountModel.save((err, user) => {
          if (err) {
            res.send(err);
          } else {
            const addressWithId = req.body.address.map((i) => ({
              ...i,
              shopId: shop._id,
            }));
            Shop.Address.insertMany(addressWithId)
              .then(function () {
                const bodyText =
                  "Shop created successfully. Your shop will be activated ASAP";
                email(
                  req.body.email,
                  "Welcome to Artcurate",
                  bodyText,
                  bodyText
                ).then(
                  (data) => {
                    res.send(data);
                  },
                  (err) => {
                    res.send(err);
                  }
                );
                return res.send(shop);
              })
              .catch(function (error) {
                console.log(error); // Failure
              });
          }
        });
        // shopSubscriptionsModel.save((err, resp) => {
        //     if (err) {
        //         res.send(err);
        //     } else {
        //         res.send('Shop subscription added');
        //     }
        // })
      }
    }
  });
});

router.post("/postaddress", userMiddleware.verifyToken, (req, res) => {
  let model = new Shop.Address(req.body);
  model.save((err, resp) => {
    if (err) {
      res.send(err);
    } else {
      res.send("Shop address added");
    }
  });
});

router.post("/accounts", userMiddleware.verifyToken, (req, res) => {
  let model = new Shop.Details(req.body);
  model.save((err, user) => {
    if (err) {
      res.send(err);
    } else {
      res.send("Bank account added");
    }
  });
});

router.put("/update/:id", userMiddleware.verifyToken, (req, res) => {
  let id = req.params.id;
  Shop.Details.findOneAndUpdate(
    { _id: id },
    req.body,
    {
      timestamps: { createdAt: false, updatedAt: true },
    },
    (err, data) => {
      if (err) {
        res.status(400).json({ err });
      } else {
        res.status(200).json({ data });
      }
    }
  );
});
router.put("/update/accounts/:id", userMiddleware.verifyToken, (req, res) => {
  let id = req.params.id;
  Shop.Accounts.findOneAndUpdate(
    { _id: id },
    req.body,
    {
      timestamps: { createdAt: false, updatedAt: true },
    },
    (err, data) => {
      if (err) {
        console.log(error); // Failure
        res.status(400).json({ err });
      } else {
        res.status(200).json({ data });
      }
    }
  );
});
router.put("/update/address/:id", userMiddleware.verifyToken, (req, res) => {
  let id = req.params.id;
  Shop.Accounts.findOneAndUpdate(
    { _id: id },
    req.body,
    {
      timestamps: { createdAt: false, updatedAt: true },
    },
    (err, data) => {
      if (err) {
        res.status(400).json({ err });
      } else {
        res.status(200).json({ data });
      }
    }
  );
});

router.get("/shopannouncement", (req, res) => {
  Shop.Annoucement.find((err, shop) => {
    if (err) {
      res.send(err);
    } else {
      if (!shop) {
        res.status(404).send("No Shop announcement Found");
      } else {
        res.send(shop);
      }
    }
  });
});

router.post("/shopannocement", (req, res) => {
  let model = new Shop.Annoucement(req.body);
  model.save((err, user) => {
    if (err) {
      res.send(err);
    } else {
      res.send("Shop Announcement Created");
    }
  });
});

router.put("/announcementupdate/:id", (req, res) => {
  let id = req.params.id;
  Shop.Annoucement.findOneAndUpdate(
    { _id: id },
    req.body,
    {
      timestamps: { createdAt: false, updatedAt: true },
    },
    (err, data) => {
      if (err) {
        res.status(400).json({ err });
      } else {
        res.status(200).json({ data });
      }
    }
  );
});

module.exports = router;
