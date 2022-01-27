const express = require('express');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const cookieParser = require('cookie-parser');
const _ = require("lodash");
const AWS = require('aws-sdk');
const Admin = require('./models');
const config = require('../../helper/config');
const email = require('../../middleware/email');
const userMiddleware = require('../../middleware/user');
const uploadMiddleware = require('../../middleware/uploadImage');

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });
const app = express()
app.use(cookieParser())

const s3Client = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.REGION
});

var params = {
    Bucket: `${config.DocumentsBucket}`,
    // Key: 'user', // pass key
    Key: '', // pass key
    Body: null, // pass file body
    ContentType: 'image/png'
}


// This is Only for Admin User
router.get("/info/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    Admin.Auth.findById(id, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            let obj = {
                fname: data.fname,
                lname: data.lname,
                role: data.role,
                username: data.username,
                email: data.email,
                countryCode: 91,
                phone: `+${data.countryCode}-${data.phone}`,
                emailVerified: data.emailVerified,
                phoneVerified: data.phoneVerified
            };
            res.send(obj);
        }
    });
});
/**
{
    "username": "Swarup7",
    "password": "Swarup@123"
}
 */
router.post("/login", (req, res) => {
    let obj = {};
    obj.email = req.body.email;
    obj.password = req.body.password;
    // obj.password = jwt.sign(obj.password, 'ssshhhhh');
    obj.status = true;
    obj.role = 'Admin';

    Admin.Auth.findOne(obj, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            if (data == null) {
                res.status(401).json({ error: "Username & password is not Valid" });
            } else {
                console.log(data);
                let obj = { username: data.username, email: data.email, role: data.role };
                let token = jwt.sign(obj, config.secrateKey, {
                    expiresIn: 1800 // expires in 30 minuites
                    
                });
                let refreshToken = jwt.sign(obj, config.refreshSecrateKey, {
                    expiresIn: '14d' // expires in 14 days
                });
                res.cookie("access-token", token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
                res.cookie("refresh-token", refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 14 });
                res.json({
                    id: data._id,
                    username: data.username,
                    fname: data.fname,
                    email: data.email,
                    role: data.role,
                });
            }
        }
    });
})


// Create New User 
/**
 * {
        "fname": "Swarup",
        "lname": "Saha",
        "role": "Admin",
        "username": "Swarup7",
        "password": "Swarup@123",
        "email": "swarup.saha004@hotmail.com",
        "countryCode": 91,
        "phone": 9035845781
 * }
 */
router.post("/signup", userMiddleware.checkExestingAdmin, (req, res) => {
    let obj = req.body;
    let model = new Admin.Auth(obj);
    // model.password = jwt.sign(obj.password, 'shhhhh');
    model.save((err, user) => {
        if (err) {
            res.send(err.message);
        } else {
            // let decoded = jwt.verify(user.password, 'shhhhh');
            let token = jwt.sign(obj, config.secrateKey, {
                expiresIn: 1800, // expires in 30 minuites
                
            });
            let refreshToken = jwt.sign(obj, config.refreshSecrateKey, {
                expiresIn: '2d', // expires in 2 days
                
            });
            res.cookie("access-token", token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
            res.cookie("refresh-token", refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 14 });
            res.json({
                id: user._id,
                username: user.username,
                fname: user.fname,
                email: data.email,
                role: user.role,
            });
        }
    });
});

router.post("/forgotPassword", (req, res) => {
    Admin.Auth.findOne(req.body, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            if (!user) {
                res.status(404).send("No User Found");
            } else {
                const url = 'localhost:3000/admin/forgotpassword?id=' + user.id;
                const resetUrlText = "Reset url is <a href='" + url + "'>" + url + "</a>";
                const resetUrlTemplate = "Reset url is <a href='" + url + "'>" + url + "</a>";

                email(user.email, 'Reset Url', resetUrlTemplate, resetUrlText).then(data => {
                    res.send(data);
                }, err => {
                    res.send(err);
                });
            }
        }
    })
});

//Change Password
router.post('/changePassword', async (req, res) => {
    const id = req.body.id;
    const pass = req.body.password;
console.log(id);
    Admin.Auth.findById(id, (err, user) => {
        if (err) {
            res.json({
                error: err,
                message: "Id is not correct"
            });
        } else {
            if (user == null) {
                res.status(404).send("No User Found");
            } else {
                Admin.Auth.findOneAndUpdate({ _id: id }, { password: pass }, (err, data) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send("Password updated succesfully");
                    }
                });
            }
        }
    });
});


// Active Previous Deactivated User. & Deactivate Active User.
router.put("/activeDeactivateUser/:id", (req, res) => {
    let id = req.params.id;
    let status = req.body;
    Admin.Auth.findById(id, (err, user) => {
        if (err) {
            res.json({
                error: err,
                message: "Id is not correct"
            });
        } else {
            if (user == null) {
                res.status(404).send("User id not found");
            } else {
                Admin.Auth.findOneAndUpdate({ _id: id }, status, (err, data) => {
                    if (err) {
                        res.send(err);
                    } else {
                        if (req.body.status == false) {
                            res.status(200).json({
                                status: 'succes',
                                data: "User is Deactivated",
                            });
                        }
                        res.status(200).json({
                            status: 'succes',
                            data: "User is Activated",
                        });
                    }
                });
            }
        }
    });
});


/**
 * Varify Phone
 *  */
router.get("/generateVarificationCode/:type/:id", userMiddleware.getUserInfo, (req, res) => {
    const type = req.params.type;      // For Mail & Send Message
    const id = req.params.id;
    const securityCode = userMiddleware.generateSecurityCode();
    const securityCodeText = "Varification Code is " + securityCode;
    const securityCodeTemplate = "<h1>Email varification code is " + securityCode + "</h1>";
    Admin.Auth.findOneAndUpdate({ _id: id }, { securityCode: securityCode }, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            // For Mail & Send Message
            if (type == 'email') {
                email(user.email, 'Security Code', securityCodeTemplate, securityCodeText).then(data => {
                    res.send(data);
                }, err => {
                    console.log(err);
                    res.send(err);
                });
            } else {
                res.send(securityCode);
            }
        }
    })
});

router.put("/varification/:type/:id", (req, res) => {
    const obj = {};
    const id = req.params.id;
    const type = req.params.type;
    const securityCode = req.body.securityCode;

    if (type == "email") {
        obj.emailVerified = 1;
    } else {
        obj.phoneVerified = 1;
    }

    Admin.Auth.findById(id, { securityCode: 1 }, (err, code) => {
        if (err) {
            res.send(err);
        } else {
            if (code.securityCode == securityCode) {
                Admin.Auth.findOneAndUpdate({ _id: id }, obj, (err, data) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(`Admin's ${type} has varified`);
                    }
                });
            } else {
                res.send(`Admin's ${type} has not varified. Because you have entered wrong Security Code`);
            }
        }
    });
});


/**
 * Insert Admin Details
 *  */
// Insert Logged in Admin Details
router.post("/insertUserDetails", (req, res) => {
    let obj = req.body;
    let model = new Admin.Details(obj);
    model.save((err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.send('Admin data inserted');
        }
    })
});

// Get Logged in Admin Details
router.get("/userDetails/:id", (req, res) => {
    let id = req.params.id;
    Admin.Details.findOne({ userId: id }, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

router.post('/uploadProfilePics/:id', upload.single("profile"), uploadMiddleware.uploadImage, (req, res) => {
    let obj = {
        userId: req.body.id,
        profilePics: req.file.originalname
    }
    let model = new Admin.ProfilePics(obj);
    model.save((err, profile) => {
        if (err) {
            res.send(err);
        } else {
            res.json('Profile picture uploaded successfully');
        }
    });
});

router.post('/auth/refresh-token', (req, res, next) => {
    let refToken = req.body.refToken;
    let obj = {...req.body.id,...req.body.email}
    if (!refToken) {
        res.status(401).send({ auth: false, message: 'No token provided.' })
    } else {
        jwt.verify(refToken, config.refreshSecrateKey, (err, decoded) => {
            if (err) {
                res.status(500).json({ auth: false, message: 'Failed to authenticate refresh token.', error: err });
            } else {
                let token = jwt.sign(obj, config.secrateKey, {
                    expiresIn: 1800 // expires in 30 minuites 
                });
                let refreshToken = jwt.sign(obj, config.refreshSecrateKey, {
                    expiresIn: '14d' // expires in 14 days
                    
                });
                res.cookie("access-token", token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
                res.cookie("refresh-token", refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 14 });
                res.json({
                    token: token,
                    refreshToken: refreshToken
                });     
            }
        });
    }
});

router.post('/logout', userMiddleware.verifyToken, (req, res) => {
    try{
        res.clearCookie('access-token');
        res.clearCookie('refresh-token');
        res.status(200).json({
            message: "logged out successfully"
        })
    } catch(error){
        res.status(400).send(error)
    }
});

// Add User Category Details
router.post("/addUserCategory", (req, res) => {
  let obj = req.body;
  let model = new Admin.UserCategory(obj);
  model.save((err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json({
        data: data,
        message: "User Category Details Added Successfully",
      });
    }
  });
});

// Add Showcase Type
router.post("/addShowcaseType", async (req, res) => {
   
    await Admin.ShowcaseType.find({ showcaseType: (req.body.showcaseType).split(' ').map(_.capitalize).join(' ') }, (err, data) => {
        if(err) throw err;
        else {
            if(data.length !== 0) {
                res.status(409).json({
                    message: "Showcase Type Already Exists!"
                });
            } else {

           
            Admin.ShowcaseType.find().sort({_id:-1}).then(result =>{
               if(result.length === 0){
                let storedata=  generateId('ST-00');
                let obj = {
                  showcaseType: (req.body.showcaseType).split(' ').map(_.capitalize).join(' '),
                   showcaseId:storedata,
              };
                  let model = new Admin.ShowcaseType(obj);
                  model.save((err, data) => {
                      if (err || !data) {
                          res.status(400).send(err);
                      } else {
                          res.status(200).json({
                              data: data,
                              message: "Showcase Type Added Successfully",
                          });
                      }
                  });
               }else{
                let storedata=  generateId(result[0].showcaseId);
                let obj = {
                  showcaseType: (req.body.showcaseType).split(' ').map(_.capitalize).join(' '),
                   showcaseId:storedata,
              };
                  let model = new Admin.ShowcaseType(obj);
                  model.save((err, data) => {
                      if (err || !data) {
                          res.status(400).send(err);
                      } else {
                          res.status(200).json({
                              data: data,
                              message: "Showcase Type Added Successfully",
                          });
                      }
                  });
               }

               
            });
           
              
            }

        }
    });
});

function generateId(inputText) {
    var str;
    var num;
    var split_string = inputText.split(/(\d+)/);
    num= split_string[1];
    str= split_string[0] ;
    var arr = split_string[1].split(",").map(function (val) {
      return Number(val) + 1;
    });
    if(arr>9){
      var output = str+arr;
    }else{
      var output = str+'0'+arr;
    }
    return output;
}



router.get("/getShowcaseType", (req, res) => {
    Admin.ShowcaseType.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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
router.get("/ShowcaseType/:id", (req, res) => {
    const Id = req.params.id;
    Admin.ShowcaseType.find({ _id: Id },{createdAt:0,updatedAt:0}, (err, data) => {
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

router.put("/updateShowcaseType/:id", (req, res) => {
    const id = req.params.id;
    const body = {showcaseType:(req.body.showcaseType).split(' ').map(_.capitalize).join(' ')};
    Admin.ShowcaseType.findOneAndUpdate({ _id: id }, body, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json({
            success: true,
            message: "showcase Type Has Been Updated Successfully",
        });
      }
    });
});

router.delete("/deleteShowcaseType/:id",(req, res) => {
    const id = req.params.id;
    Admin.ShowcaseType.findOneAndDelete({ _id: id }, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
          res.status(200).json({
              success: true,
              message: "Showcase Type Deleted Successfully",
          });
      }
    });
  }
);
router.put("/ActiveInActiveShowcaseType/:id", (req, res) => {
    const id = req.params.id;
    const body = {status:req.body.status};
    if(req.body.status == false){
        Admin.ShowcaseType.findOneAndUpdate({ _id: id }, {status:true}, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Price Types Has Been Active",
              });
            }
          });
    }else{
        Admin.ShowcaseType.findOneAndUpdate({ _id: id }, body, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Price Types  InActive",
              });
            }
          });
    }
   
  });

 
// Add Main Product 
router.post("/addMainProduct", async (req, res) => {
    await Admin.MainProducts.find({ mainProductName: (req.body.mainProductName).split(' ').map(_.capitalize).join(' ') }, (err, data) => {
        if(err) throw err;
        else {
            if(data.length !== 0) {
                res.status(409).json({
                    message: "Main Product Name Already Exists!"
                });
            } else {
               Admin.MainProducts.find({ sortOrder: req.body.sortOrder }, (err, data) => {
                if(err) throw err;
                else{
                  if(data.length !== 0) {
                    res.status(409).json({
                        message: "sortOrder Already Exists!"
                    });
                }else{
                  Admin.MainProducts.find().sort({_id:-1}).then(result =>{
                    if(result.length === 0){
                     let storedata=  generateId('MP-00');
                     let obj = {
                      mainProductName: (req.body.mainProductName).split(' ').map(_.capitalize).join(' '),
                      packingType:req.body.packingType,
                      metaKeyword: req.body.metaKeyword,
                      sortOrder: req.body.sortOrder,
                      mProductId:storedata,
                  };
                    
                   let model = new Admin.MainProducts(obj);
                   model.save((err, data) => {
                       if (err || !data) {
                           res.status(400).send(err);
                       } else {
                           res.status(200).json({
                               data: data,
                               message: "Main Products Added Successfully",
                           });
                       }
                   });
                    }else{
                     let storedata=  generateId(result[0].mProductId);
                     let obj = {
                      mainProductName: (req.body.mainProductName).split(' ').map(_.capitalize).join(' '),
                      metaKeyword: req.body.metaKeyword,
                      sortOrder: req.body.sortOrder,
                      mProductId:storedata,
                  };
                   let model = new Admin.MainProducts(obj);
                   model.save((err, data) => {
                       if (err || !data) {
                           res.status(400).send(err);
                       } else {
                           res.status(200).json({
                               data: data,
                               message: "Main Products Added Successfully",
                           });
                       }
                   });
                    }
     
                    
                 });
                }
               
             
            }
            });  
            }

        }
    });
});

router.get("/MainProducts/:id", (req, res) => {
    const Id = req.params.id;
    Admin.MainProducts.find({ _id: Id },{createdAt:0,updatedAt:0}, (err, data) => {
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
router.get("/getMainProducts", (req, res) => {
    
    Admin.MainProducts.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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



router.put("/updateMainProducts/:id", (req, res) => {
    const id = req.params.id;
    let body = {
        mainProductName: (req.body.mainProductName).split(' ').map(_.capitalize).join(' '),
        packingType:req.body.packingType,
        metaKeyword: req.body.metaKeyword,
        sortOrder: req.body.sortOrder,
    };
    Admin.MainProducts.findOneAndUpdate({ _id: id }, body, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json({
            success: true,
            message: "showcase Type Has Been Updated Successfully",
        });
      }
    });
});
router.put("/ActiveInActiveMainProduct/:id", (req, res) => {
    const id = req.params.id;
    const body = {status:req.body.status};
    if(req.body.status == false){
        Admin.MainProducts.findOneAndUpdate({ _id: id }, {status:true}, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Price Types Has Been Active",
              });
            }
          });
    }else{
        Admin.MainProducts.findOneAndUpdate({ _id: id }, body, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Price Types  InActive",
              });
            }
          });
    }
   
  });

  router.delete("/deleteMainProducts/:id",(req, res) => {
    const id = req.params.id;
    Admin.MainProducts.findOneAndDelete({ _id: id }, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
          res.status(200).json({
              success: true,
              message: "Main Products Deleted Successfully",
          });
      }
    });
  }
);

// Add Product Category 
router.post("/addProductCategory",upload.single("productImage"), async (req, res) => {
    await Admin.ProductCategory.find({ categoryName: (req.body.categoryName).split(' ').map(_.capitalize).join(' '),mainProductName: req.body.mainProductName }, (err, data) => {
    if(err) throw err;
    else {
        if(data.length !== 0) {
            res.status(409).json({
                message: "product category Already Exists!"
            });
        } else {
          Admin.ProductCategory.find({ sortOrder: req.body.sortOrder }, (err, data) => {
            if(err) throw err;
            else{
              if(data.length !== 0) {
                res.status(409).json({
                    message: "sortOrder Already Exists!"
                });
            }else{
            const file = req.body.productImage;
            
            buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
            params.Key= `${req.body.categoryName}-${Date.now()}.png`,
            params.Body= buf,
            
            s3Client.upload(params, function (err, data) {
                if (err || !data) {
                    res.status(400).send(err.message);
                }else{
                  Admin.ProductCategory.find().sort({_id:-1}).then(result =>{
                    if(result.length === 0){
                     let storedata=  generateId('PC-00');
                     let obj = {
                      ProductImage: data.Location,
                      pCategoryId:storedata,
                      mainProductName: req.body.mainProductName,
                      categoryName: (req.body.categoryName).split(' ').map(_.capitalize).join(' '),
                      metaKeyword: req.body.metaKeyword,
                      sortOrder: req.body.sortOrder,
                  };
                  let model = new Admin.ProductCategory(obj);
                              model.save((err, data) => {
                                  if (err || !data) {
                                      res.status(400).send(err);
                                  } else {
                                      res.status(200).json({
                                          data: data,
                                          message: "Product category Added Successfully",
                                      });
                                  }
                              });
                    }else{
                     let storedata=  generateId(result[0].pCategoryId);
                     let obj = {
                      ProductImage: data.Location,
                      pCategoryId:storedata,
                      mainProductName: req.body.mainProductName,
                      categoryName: (req.body.categoryName).split(' ').map(_.capitalize).join(' '),
                      metaKeyword: req.body.metaKeyword,
                      sortOrder: req.body.sortOrder,
                  };
                  let model = new Admin.ProductCategory(obj);
                              model.save((err, data) => {
                                  if (err || !data) {
                                      res.status(400).send(err);
                                  } else {
                                      res.status(200).json({
                                          data: data,
                                          message: "Product category Added Successfully",
                                      });
                                  }
                              });
                    }
     
                    
                 });
                   
                        
                   
                }
            });
          }
        }
        
          });
        }

    }
   
   });
});

router.get("/getProductCategory", (req, res) => {
    
    Admin.ProductCategory.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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
router.get("/ProductCategory/:id", (req, res) => {
    const Id = req.params.id;
    Admin.ProductCategory.find({ _id: Id },{createdAt:0,updatedAt:0}, (err, data) => {
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
router.put("/updateProductCategory/:id",upload.single("productImage"), (req, res) => {
    const file = req.body.productImage;
    buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
    params.Key= `${req.body.categoryName}-${Date.now()}.png`,
    params.Body= buf,
    s3Client.upload(params, function (err, data) {
        if (err || !data) {
            res.status(400).send(err.message);
        }else{
            const id = req.params.id;
            let obj = {
                productImage: data.Location,
                mainProductName: req.body.mainProductName,
                categoryName: (req.body.categoryName).split(' ').map(_.capitalize).join(' '),
                metaKeyword: req.body.metaKeyword,
                sortOrder: req.body.sortOrder,
            };
            Admin.ProductCategory.findOneAndUpdate({ _id: id }, obj, (err, data) => {
              if (err) {
                res.status(400).send(err.message);
              } else {
                res.status(200).json({
                    success: true,
                    message: "Product Category Has Been Updated Successfully",
                });
              }
            });
                
           
        }
    });
   
});

router.delete("/deleteProductCategory/:id",(req, res) => {
    const id = req.params.id;
    Admin.ProductCategory.findOneAndDelete({ _id: id }, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
          res.status(200).json({
              success: true,
              message: "Product Category Deleted Successfully",
          });
      }
    });
  }
);
router.put("/ActiveInActiveProductCategory/:id", (req, res) => {
    const id = req.params.id;
    const body = {status:req.body.status};
    if(req.body.status == false){
        Admin.ProductCategory.findOneAndUpdate({ _id: id }, {status:true}, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Product Category Has Been Active",
              });
            }
          });
    }else{
        Admin.ProductCategory.findOneAndUpdate({ _id: id }, body, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Product Category  InActive",
              });
            }
          });
    }
   
});

// Add Product Sub Category 
router.post("/addProductSubCategory",upload.single("subCategoryImage"), async (req, res) => {
    await Admin.ProductSubCategory.find({ subCategory: (req.body.subCategory).split(' ').map(_.capitalize).join(' '),categoryName: req.body.categoryName, }, (err, data) => {
    if(err) throw err;
    else {
        if(data.length !== 0) {
            res.status(409).json({
                message: "product category Already Exists!"
            });
        } else {
          Admin.ProductSubCategory.find({ sortOrder: req.body.sortOrder }, (err, data) => {
            if(err) throw err;
            else{
              if(data.length !== 0) {
                res.status(409).json({
                    message: "sortOrder Already Exists!"
                });
            }else{
            const file = req.body.subCategoryImage;
            buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
            params.Key= `${req.body.subCategory}-${Date.now()}.png`,
            params.Body= buf,
            
            s3Client.upload(params, function (err, data) {
                if (err || !data) {
                    res.status(400).send(err.message);
                }else{

                  Admin.ProductSubCategory.find().sort({_id:-1}).then(result =>{
                    if(result.length === 0){
                     let storedata=  generateId('SC-00');
                     let obj = {
                      pSubCategoryId:storedata,
                        subCategoryImage: data.Location,
                        mainProductName: req.body.mainProductName,
                        categoryName: req.body.categoryName,
                        subCategory:(req.body.subCategory).split(' ').map(_.capitalize).join(' '),
                        metaKeyword: req.body.metaKeyword,
                        sortOrder: req.body.sortOrder,
                    };
                    let model = new Admin.ProductSubCategory(obj);
                                model.save((err, data) => {
                                    if (err || !data) {
                                        res.status(400).send(err);
                                    } else {
                                        res.status(200).json({
                                            data: data,
                                            message: "Product sub category Added Successfully",
                                        });
                                    }
                                });
                    }else{
                     let storedata=  generateId(result[0].pSubCategoryId);
                     let obj = {
                      pSubCategoryId:storedata,
                        subCategoryImage: data.Location,
                        mainProductName: req.body.mainProductName,
                        categoryName: req.body.categoryName,
                        subCategory:(req.body.subCategory).split(' ').map(_.capitalize).join(' '),
                        metaKeyword: req.body.metaKeyword,
                        sortOrder: req.body.sortOrder,
                    };
                    let model = new Admin.ProductSubCategory(obj);
                                model.save((err, data) => {
                                    if (err || !data) {
                                        res.status(400).send(err);
                                    } else {
                                        res.status(200).json({
                                            data: data,
                                            message: "Product sub category Added Successfully",
                                        });
                                    }
                                });
                    }
     
                    
                 });
                   
                        
                   
                }
            });
          }
        }
      });
        }

    }
   
   });
});

router.get("/getProductSubCategory", (req, res) => {
    
    Admin.ProductSubCategory.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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

router.get("/ProductSubCategory/:id", (req, res) => {
    const Id = req.params.id;
    Admin.ProductSubCategory.find({ _id: Id },{createdAt:0,updatedAt:0}, (err, data) => {
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

router.put("/updateProductsubCategory/:id",upload.single("subCategoryImage"), (req, res) => {
    const file = req.body.subCategoryImage;
    buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
    params.Key= `${req.body.subCategory}-${Date.now()}.png`,
    params.Body= buf,
    s3Client.upload(params, function (err, data) {
        if (err || !data) {
            res.status(400).send(err.message);
        }else{
            const id = req.params.id;
            let obj = {
                subCategoryImage: data.Location,
                mainProductName: req.body.mainProductName,
                categoryName: req.body.categoryName,
                subCategory:(req.body.subCategory).split(' ').map(_.capitalize).join(' '),
                metaKeyword: req.body.metaKeyword,
                sortOrder: req.body.sortOrder,
            };
            Admin.ProductSubCategory.findOneAndUpdate({ _id: id }, obj, (err, data) => {
              if (err) {
                res.status(400).send(err.message);
              } else {
                res.status(200).json({
                    success: true,
                    message: "Product Category Has Been Updated Successfully",
                });
              }
            });
                
           
        }
    });
   
});

router.delete("/deleteSubCategory/:id",(req, res) => {
    const id = req.params.id;
    Admin.ProductSubCategory.findOneAndDelete({ _id: id }, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
          res.status(200).json({
              success: true,
              message: "Product Category Deleted Successfully",
          });
      }
    });
  }
);

router.put("/ActiveInActiveSubCategory/:id", (req, res) => {
    const id = req.params.id;
    const body = {status:req.body.status};
    if(req.body.status == false){
        Admin.ProductSubCategory.findOneAndUpdate({ _id: id }, {status:true}, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Product sub Category Has Been Active",
              });
            }
          });
    }else{
        Admin.ProductSubCategory.findOneAndUpdate({ _id: id }, body, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Product sub Category  InActive",
              });
            }
          });
    }
   
});

// Add Product Group1 
router.post("/addProductGroup1",upload.single("group1Image"), async (req, res) => {
    await Admin.Group1.find({ group1: (req.body.group1).split(' ').map(_.capitalize).join(' '),subCategory:req.body.subCategory, }, (err, data) => {
    if(err) throw err;
    else {
        if(data.length !== 0) {
            res.status(409).json({
                message: "product group1 Already Exists!"
            });
        } else {
          Admin.Group1.find({ sortOrder: req.body.sortOrder }, (err, data) => {
            if(err) throw err;
            else{
              if(data.length !== 0) {
                res.status(409).json({
                    message: "sortOrder Already Exists!"
                });
            }else{
            const file = req.body.group1Image;
            buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
            params.Key= `${req.body.group1}-${Date.now()}.png`,
            params.Body= buf,
            
            s3Client.upload(params, function (err, data) {
                if (err || !data) {
                    res.status(400).send(err.message);
                }else{
                  Admin.Group1.find().sort({_id:-1}).then(result =>{
                    if(result.length === 0){
                     let storedata=  generateId('PGO-00');
                      let obj = {
                      pGroup1Id:storedata,
                        group1Image: data.Location,
                        mainProductName: req.body.mainProductName,
                        categoryName: req.body.categoryName,
                        subCategory:req.body.subCategory,
                        group1:(req.body.group1).split(' ').map(_.capitalize).join(' '),
                        metaKeyword: req.body.metaKeyword,
                        sortOrder: req.body.sortOrder,
                    };
                    let model = new Admin.Group1(obj);
                                model.save((err, data) => {
                                    if (err || !data) {
                                        res.status(400).send(err);
                                    } else {
                                        res.status(200).json({
                                            data: data,
                                            message: "Product group1 Added Successfully",
                                        });
                                    }
                                });
                    
                    }else{
                     let storedata=  generateId(result[0].pGroup1Id);
                     let obj = {
                      pGroup1Id:storedata,
                        group1Image: data.Location,
                        mainProductName: req.body.mainProductName,
                        categoryName: req.body.categoryName,
                        subCategory:req.body.subCategory,
                        group1:(req.body.group1).split(' ').map(_.capitalize).join(' '),
                        metaKeyword: req.body.metaKeyword,
                        sortOrder: req.body.sortOrder,
                    };
                    let model = new Admin.Group1(obj);
                                model.save((err, data) => {
                                    if (err || !data) {
                                        res.status(400).send(err);
                                    } else {
                                        res.status(200).json({
                                            data: data,
                                            message: "Product group1 Added Successfully",
                                        });
                                    }
                                });
                    }
     
                    
                 });
                   
                        
                   
                }
            });
          }
        }
      });
        }

    }
   
   });
});

router.get("/getProductGroup1", (req, res) => {
    
    Admin.Group1.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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
router.get("/ProductGroup1/:id", (req, res) => {
    const Id = req.params.id;
    Admin.Group1.findOne({ _id: Id },{createdAt:0,updatedAt:0}, (err, data) => {
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

router.put("/updateProductGroup1/:id",upload.single("group1Image"), (req, res) => {
    const file = req.body.group1Image;
    buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
    params.Key= `${req.body.group1}-${Date.now()}.png`,
    params.Body= buf,
    s3Client.upload(params, function (err, data) {
        if (err || !data) {
            res.status(400).send(err.message);
        }else{
            const id = req.params.id;
            let obj = {
                group1Image: data.Location,
                mainProductName: req.body.mainProductName,
                categoryName: req.body.categoryName,
                subCategory:req.body.subCategory,
                group1:(req.body.group1).split(' ').map(_.capitalize).join(' '),
                metaKeyword: req.body.metaKeyword,
                sortOrder: req.body.sortOrder,
            };
            Admin.Group1.findOneAndUpdate({ _id: id }, obj, (err, data) => {
              if (err) {
                res.status(400).send(err.message);
              } else {
                res.status(200).json({
                    success: true,
                    message: "Product Group1 Has Been Updated Successfully",
                });
              }
            });
                
           
        }
    });
   
});

router.delete("/deleteGroup1/:id",(req, res) => {
    const id = req.params.id;
    Admin.Group1.findOneAndDelete({ _id: id }, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
          res.status(200).json({
              success: false,
              message: "Product Group1 Deleted Successfully",
          });
      }
    });
  }
);

router.put("/ActiveInActiveGroup1/:id", (req, res) => {
    const id = req.params.id;
    const body = {status:req.body.status};
    if(req.body.status == false){
        Admin.Group1.findOneAndUpdate({ _id: id }, {status:true}, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Product Group 1 Has Been Active",
              });
            }
          });
    }else{
        Admin.Group1.findOneAndUpdate({ _id: id }, body, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Product Group1  InActive",
              });
            }
          });
    }
   
});

// Add Product Group
router.post("/addProductGroup",upload.single("productGroupImage"), async (req, res) => {
    await Admin.productGroup.find({ productGroup: (req.body.productGroup).split(' ').map(_.capitalize).join(' '),subCategory:req.body.subCategory, }, (err, data) => {
    if(err) throw err;
    else {
        if(data.length !== 0) {
            res.status(409).json({
                message: "product group Already Exists!"
            });
        } else {
          Admin.productGroup.find({ sortOrder: req.body.sortOrder }, (err, data) => {
            if(err) throw err;
            else{
              if(data.length !== 0) {
                res.status(409).json({
                    message: "sortOrder Already Exists!"
                });
            }else{
            const file = req.body.productGroupImage;
            buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
            params.Key= `${req.body.productGroup}-${Date.now()}.png`,
            params.Body= buf,
            
            s3Client.upload(params, function (err, data) {
                if (err || !data) {
                    res.status(400).send(err.message);
                }else{
                  Admin.productGroup.find().sort({_id:-1}).then(result =>{
                    if(result.length === 0){
                     let storedata=  generateId('PG-00');
                     let obj = {
                      pGroupId:storedata,
                      productGroupImage: data.Location,
                      mainProductName: req.body.mainProductName,
                      categoryName: req.body.categoryName,
                      subCategory:req.body.subCategory,
                      group1:(req.body.group1),
                      productGroup:(req.body.productGroup).split(' ').map(_.capitalize).join(' '),
                      metaKeyword: req.body.metaKeyword,
                      sortOrder: req.body.sortOrder,
                  };
                  let model = new Admin.productGroup(obj);
                              model.save((err, data) => {
                                  if (err || !data) {
                                      res.status(400).send(err);
                                  } else {
                                      res.status(200).json({
                                          data: data,
                                          message: "Product group Added Successfully",
                                      });
                                  }
                              });
                    
                    }else{
                     let storedata=  generateId(result[0].pGroupId);
                     let obj = {
                      pGroupId:storedata,
                      group1Image: data.Location,
                      mainProductName: req.body.mainProductName,
                      categoryName: req.body.categoryName,
                      subCategory:req.body.subCategory,
                      group1:req.body.group1,
                      productGroup:(req.body.productGroup).split(' ').map(_.capitalize).join(' '),
                      metaKeyword: req.body.metaKeyword,
                      sortOrder: req.body.sortOrder,
                  };
                  let model = new Admin.productGroup(obj);
                              model.save((err, data) => {
                                  if (err || !data) {
                                      res.status(400).send(err);
                                  } else {
                                      res.status(200).json({
                                          data: data,
                                          message: "Product group Added Successfully",
                                      });
                                  }
                              });
                    }
     
                    
                 });
                   
                        
                   
                }
            });
          }
        }
      });
        }

    }
   
   });
});

router.get("/getProductGroup", (req, res) => {
    
    Admin.productGroup.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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
router.get("/ProductGroup/:id", (req, res) => {
    const Id = req.params.id;
    Admin.productGroup.findOne({ _id: Id },{createdAt:0,updatedAt:0}, (err, data) => {
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

router.put("/updateProductGroup/:id",upload.single("productGroupImage"), (req, res) => {
    const file = req.body.productGroupImage;
    buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64');
    params.Key= `${req.body.productGroup}-${Date.now()}.png`,
    params.Body= buf,
    s3Client.upload(params, function (err, data) {
        if (err || !data) {
            res.status(400).send(err.message);
        }else{
            const id = req.params.id;
            let obj = {
                productGroupImage: data.Location,
                mainProductName: req.body.mainProductName,
                categoryName: req.body.categoryName,
                subCategory:req.body.subCategory,
                group1:(req.body.group1),
                productGroup:(req.body.productGroup).split(' ').map(_.capitalize).join(' '),
                metaKeyword: req.body.metaKeyword,
                sortOrder: req.body.sortOrder,
            };
            Admin.productGroup.findOneAndUpdate({ _id: id }, obj, (err, data) => {
              if (err) {
                res.status(400).send(err.message);
              } else {
                res.status(200).json({
                    success: true,
                    message: "Product Group Has Been Updated Successfully",
                });
              }
            });
                
           
        }
    });
   
});
router.delete("/deleteproductGroup/:id",(req, res) => {
    const id = req.params.id;
    Admin.productGroup.findOneAndDelete({ _id: id }, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
          res.status(200).json({
              success: false,
              message: "Product Group Deleted Successfully",
          });
      }
    });
  }
);

router.put("/ActiveInActiveproductGroup/:id", (req, res) => {
    const id = req.params.id;
    const body = {status:req.body.status};
    if(req.body.status == false){
        Admin.productGroup.findOneAndUpdate({ _id: id }, {status:true}, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Product Group Has Been Active",
              });
            }
          });
    }else{
        Admin.productGroup.findOneAndUpdate({ _id: id }, body, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Product Group  InActive",
              });
            }
          });
    }
   
});



// Add product Usability 
router.post("/addproductUsability", async (req, res) => {
    await Admin.Usability.find({ productUsability: (req.body.productUsability).split(' ').map(_.capitalize).join(' ') }, (err, data) => {
        if(err) throw err;
        else {
            if(data.length !== 0) {
                res.status(409).json({
                    message: "Usability Already Exists!"
                });
            } else {
              Admin.Usability.find({ sortOrder: req.body.sortOrder }, (err, data) => {
                if(err) throw err;
                else{
                  if(data.length !== 0) {
                    res.status(409).json({
                        message: "sortOrder Already Exists!"
                    });
                }else{
              Admin.Usability.find().sort({_id:-1}).then(result =>{
                if(result.length === 0){
                 let storedata=  generateId('PU-00');
                 let obj = {
                  pUsabilityId:storedata,
                  mainProductName: req.body.mainProductName,
                  productUsability: (req.body.productUsability).split(' ').map(_.capitalize).join(' '),
                  metaKeyword: req.body.metaKeyword,
                  sortOrder: req.body.sortOrder,
              };
              let model = new Admin.Usability(obj);
              model.save((err, data) => {
                  if (err || !data) {
                      res.status(400).send(err);
                  } else {
                      res.status(200).json({
                          data: data,
                          message: "Usability Added Successfully",
                      });
                  }
              });
                
                }else{
                 let storedata=  generateId(result[0].pUsabilityId);
                 let obj = {
                  pUsabilityId:storedata,
                  mainProductName: req.body.mainProductName,
                  productUsability: (req.body.productUsability).split(' ').map(_.capitalize).join(' '),
                  metaKeyword: req.body.metaKeyword,
                  sortOrder: req.body.sortOrder,
              };
              let model = new Admin.Usability(obj);
              model.save((err, data) => {
                  if (err || !data) {
                      res.status(400).send(err);
                  } else {
                      res.status(200).json({
                          data: data,
                          message: "Usability Added Successfully",
                      });
                  }
              });
                }
 
                
             });
            }
          }
        });
            }

        }
    });
});

router.get("/getUsability", (req, res) => {
    Admin.Usability.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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
router.get("/getUsability/:id", (req, res) => {
    const Id = req.params.id;
    Admin.Usability.findOne({ _id: Id },{createdAt:0,updatedAt:0}, (err, data) => {
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

router.put("/updateproductUsability/:id", (req, res) => {
    const id = req.params.id;
    let obj = {
      mainProductName: req.body.mainProductName,
      productUsability: (req.body.productUsability).split(' ').map(_.capitalize).join(' '),
      metaKeyword: req.body.metaKeyword,
      sortOrder: req.body.sortOrder,
  };
    const body = {productUsability:(req.body.productUsability).split(' ').map(_.capitalize).join(' ')};
    Admin.Usability.findOneAndUpdate({ _id: id }, obj, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json({
            success: true,
            message: "Usability Has Been Updated Successfully",
        });
      }
    });
});

router.delete("/deleteUsability/:id",(req, res) => {
    const id = req.params.id;
    Admin.Usability.findOneAndDelete({ _id: id }, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
          res.status(200).json({
              success: true,
              message: "Usability Has Been Deleted Successfully",
          });
      }
    });
  }
);
router.put("/ActiveInActiveUsability/:id", (req, res) => {
    const id = req.params.id;
    const body = {status:req.body.status};
    if(req.body.status == false){
        Admin.Usability.findOneAndUpdate({ _id: id }, {status:true}, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Usability Has Been Active",
              });
            }
          });
    }else{
        Admin.Usability.findOneAndUpdate({ _id: id }, body, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Usability  InActive",
              });
            }
          });
    }
   
  });
// Price Type
router.post("/addPriceType", (req, res) => {
    let model = new Admin.Pricetypes({
        priceType: req.body.priceType
    })
    model.save((err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json({
            success: true,
            result: data,
            message: "Price Types Has Been Added Successfully",
        });
       }
    });
});

router.get("/Pricetypes/:id", (req, res) => {
    const PriceId = req.params.id;
    Admin.Pricetypes.find({ _id: PriceId },{createdAt:0,updatedAt:0}, (err, data) => {
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

  router.put("/updatePriceType/:id", (req, res) => {
    const id = req.params.id;
    const body = {priceType:req.body.priceType};
    Admin.Pricetypes.findOneAndUpdate({ _id: id }, body, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json({
            success: true,
            result: data,
            message: "Price Types Has Been Updated Successfully",
        });
      }
    });
  });

  router.delete("/deletePricetype/:id",(req, res) => {
      const id = req.params.id;
      Admin.Pricetypes.findOneAndDelete({ _id: id }, (err, data) => {
        if (err) {
          res.status(400).send(err.message);
        } else {
            res.status(200).json({
                success: true,
                message: "Price Types Has Been Deleted Successfully",
            });
        }
      });
    }
  );

  router.put("/ActiveInActivePriceType/:id", (req, res) => {
    const id = req.params.id;
    const body = {status:req.body.status};
    if(req.body.status == false){
        Admin.Pricetypes.findOneAndUpdate({ _id: id }, {status:true}, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Price Types Has Been Active",
              });
            }
          });
    }else{
        Admin.Pricetypes.findOneAndUpdate({ _id: id }, body, (err, data) => {
            if (err) {
              res.status(400).send(err.message);
            } else {
              res.status(200).json({
                  success: true,
                  message: "Price Types  InActive",
              });
            }
          });
    }
   
  });

  // Packing Type
router.post("/addPackingType", (req, res) => {
  let model = new Admin.packing({
    packingType: (req.body.packingType).split(' ').map(_.capitalize).join(' '),
  })
  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
          success: true,
          result: data,
          message: "packing Type Has Been Added Successfully",
      });
     }
  });
});

router.get("/packingType/:id", (req, res) => {
  const packingId = req.params.id;
  Admin.packing.find({ _id: packingId },{createdAt:0,updatedAt:0}, (err, data) => {
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
router.get("/packingType", (req, res) => {
  Admin.packing.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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

router.put("/updatePackingType/:id", (req, res) => {
  const id = req.params.id;
  const body = {packingType: (req.body.packingType).split(' ').map(_.capitalize).join(' '),};
  Admin.packing.findOneAndUpdate({ _id: id }, body, (err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
          success: true,
          result: data,
          message: "packing Types Has Been Updated Successfully",
      });
    }
  });
});

router.delete("/deletePacking/:id",(req, res) => {
  const id = req.params.id;
  Admin.packing.findOneAndDelete({ _id: id }, (err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
        res.status(200).json({
            success: true,
            message: "packing Types Has Been Deleted Successfully",
        });
    }
  });
}
);

router.post("/CategoryByMain", (req, res) => {
  const mainProduct = req.body.mainProductName;
  Admin.ProductCategory.find({ mainProductName: mainProduct },
    {createdAt:0,updatedAt:0,ProductImage:0,_id:0,mainProductName:0,metaKeyword:0,sortOrder:0,status:0},
     (err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        data: data,
      });
    }
  });
});
router.post("/subCategoryByCategory", (req, res) => {
  const category = req.body.categoryName;
  Admin.ProductSubCategory.find({ categoryName: category },
    {createdAt:0,updatedAt:0,subCategoryImage:0,_id:0,mainProductName:0,metaKeyword:0,sortOrder:0,status:0,categoryName:0},
     (err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        data: data,
      });
    }
  });
});

router.post("/group1BysubCategory", (req, res) => {
  const subCategory = req.body.subCategory;
  Admin.Group1.find({ subCategory: subCategory },
    {createdAt:0,updatedAt:0,group1Image:0,_id:0,mainProductName:0,metaKeyword:0,sortOrder:0,status:0,categoryName:0,subCategory:0},
     (err, result) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      if(result[0].group1==null){
        Admin.productGroup.find({ subCategory: subCategory },
          {createdAt:0,updatedAt:0,productGroupImage:0,group1:0,_id:0,mainProductName:0,metaKeyword:0,sortOrder:0,status:0,categoryName:0,subCategory:0},
           (err, data) => {
          if (err) {
            res.status(400).send(err.message);
          } else {
            res.status(200).json({
              data: data,
            });
          }
        });
      }else{
        res.status(200).json({
          result: result,
        });
      }
     
    }
  });
});
router.post("/productGroupByGroup1", (req, res) => {
  const group1 = req.body.group1;
  Admin.productGroup.find({ group1: group1 },
    {createdAt:0,updatedAt:0,productGroupImage:0,group1:0,_id:0,mainProductName:0,metaKeyword:0,sortOrder:0,status:0,categoryName:0,subCategory:0},
     (err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        data: data,
      });
    }
  });
});

router.post("/changeOrderMain",(req,res)=>{
  const data=req.body;
   Admin.MainProducts.bulkWrite(
     data.map((item) => 
     ({
       updateOne: {
         filter: { _id: item._id },
         update: { $set: item }
       }
     })
   )
 ).then(data =>{
   res.status(200).json({
     success: true,
     message: " Updated Successfully",
 });
 })
   
 });

 router.post("/changeOrderCategory",(req,res)=>{
  const data=req.body;
   Admin.ProductCategory.bulkWrite(
     data.map((item) => 
     ({
       updateOne: {
         filter: { _id: item._id },
         update: { $set: item }
       }
     })
   )
 ).then(data =>{
   res.status(200).json({
     success: true,
     message: " Updated Successfully",
 });
 })
   
 });

 router.post("/changeOrderSubCategory",(req,res)=>{
  const data=req.body;
   Admin.ProductSubCategory.bulkWrite(
     data.map((item) => 
     ({
       updateOne: {
         filter: { _id: item._id },
         update: { $set: item }
       }
     })
   )
 ).then(data =>{
   res.status(200).json({
     success: true,
     message: " Updated Successfully",
 });
 })
   
 });
 router.post("/changeOrderProductGroup",(req,res)=>{
  const data=req.body;
   Admin.productGroup.bulkWrite(
     data.map((item) => 
     ({
       updateOne: {
         filter: { _id: item._id },
         update: { $set: item }
       }
     })
   )
 ).then(data =>{
   res.status(200).json({
     success: true,
     message: " Updated Successfully",
 });
 })
   
 });

 router.post("/changeOrderGroup1",(req,res)=>{
  const data=req.body;
   Admin.Group1.bulkWrite(
     data.map((item) => 
     ({
       updateOne: {
         filter: { _id: item._id },
         update: { $set: item }
       }
     })
   )
 ).then(data =>{
   res.status(200).json({
     success: true,
     message: " Updated Successfully",
 });
 })
   
 });

 router.post("/changeOrderUsability",(req,res)=>{
  const data=req.body;
   Admin.Usability.bulkWrite(
     data.map((item) => 
     ({
       updateOne: {
         filter: { _id: item._id },
         update: { $set: item }
       }
     })
   )
 ).then(data =>{
   res.status(200).json({
     success: true,
     message: " Updated Successfully",
 });
 })
   
 });
module.exports = router;
