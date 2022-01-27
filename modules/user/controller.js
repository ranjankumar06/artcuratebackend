const express = require('express');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const axios = require("axios");
const bcrypt = require("bcrypt");
const {OAuth2Client} = require("google-auth-library");
const fetch = require("node-fetch");
const ip=require("ip");
const ObjectId = require("mongoose").Types.ObjectId;
const _ = require("lodash");

const client = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const tlClient = axios.create({
    baseURL: "https://api.textlocal.in/",
    params: {
        apiKey: "NjU2NDU2NGU0NDUxNjI3NDU2NTg0MjU4Njk0MTQyNDU=", //Text local api key
        sender: "ARTCRT"
    }
});

const User = require('./models');
const adminModel = require('../admin/models');
const config = require('../../helper/config');
const userMiddleware = require('../../middleware/user');
const email = require('../../middleware/email');
const uploadMiddleware = require('../../middleware/uploadImage');

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

// Google Authentication
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.get("/userList", (req, res) => {
  User.Auth.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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
// Get All User Information. This is Only for Admin User
router.get("/info/:id", (req, res) => {
    const id = req.params.id;
    User.Auth.aggregate([
      { $match: { _id: ObjectId(id), } },
      {
          $lookup: {
              from: 'userworkexperiences',
              localField: '_id',
              foreignField: 'userId',
              as: 'experiences'
          },
      },
      {
        $lookup: {
            from: 'userdetails',
            localField: '_id',
            foreignField: 'userId',
            as: 'userDetails'
        },
    },
      {
          $lookup: {
              from: 'usercertifications',
              localField: '_id',
              foreignField: 'userId',
              as: 'certifications'
          },
      },
      {
        $lookup: {
            from: 'userskills',
            localField: '_id',
            foreignField: 'userId',
            as: 'skills'
        },
    },
    {
      $lookup: {
          from: 'userpatents',
          localField: '_id',
          foreignField: 'userId',
          as: 'patents'
      },
  },
    {
      $lookup: {
          from: 'UserAwards',
          localField: '_id',
          foreignField: 'userId',
          as: 'awards'
      },
  },
      {
          $lookup: {
              from: 'usereducations',
              localField: '_id',
              foreignField: 'userId',
              as: 'education'
          },
      }
  ]).then(data => {
      res.status(200).json(data);
  }).catch(err => {
      res.status(400).json(err);
  });
});

// Get All User Information. This is Only for User
router.get("/getAllUsers", (req, res) => {
  User.Auth.aggregate([
    {
        $lookup: {
          from: 'userProfilePics',
          localField: '_id',
          foreignField: 'userId',
          as: 'ProfilePics'
      },
    },
    {
      $project: {
        _id: "$_id",
        userId: "$userId",
        fname: "$fname",
        lname: "$lname",
        username:"$username",
        name:"$name",
        role:"$role",
        profilePics: "$ProfilePics.profilePics",
        status: "$status",
      },
    },
]).then(data => {
    res.status(200).json(data);
}).catch(err => {
    res.status(400).json(err);
});
});

// Get  User profile. 
router.get("/getProfile/:id", (req, res) => {
  const id = req.params.id;
  User.Auth.aggregate([
    { $match: { _id: ObjectId(id), } },
    {
      $lookup: {
          from: 'userdetails',
          localField: '_id',
          foreignField: 'userId',
          as: 'userDetails'
      },
  },
 
    {
      $project: {
        _id: "$_id",
        userId: "$userId",
        fname: "$fname",
        lname: "$lname",
        email:"$email",
        countryCode:"$countryCode",
        phone:"$phone",
        about:"$about",
        name:"$name",
        secondaryRole:"$secondaryRole",
        primaryRole:"$primaryRole",
        role:"$role",
        address: "$userDetails.address",
        emailVerified:"$emailVerified",
        phoneVerified:"$phoneVerified",
        status: "$status",
      },
    },
]).then(data => {
    res.status(200).json(data);
}).catch(err => {
    res.status(400).json(err);
});
});

router.get("/getSettings/:id", (req, res) => {
  const id = req.params.id;
  User.Auth.aggregate([
    { $match: { _id: ObjectId(id), } },
    {
      $lookup: {
          from: 'usernotifications',
          localField: '_id',
          foreignField: 'userId',
          as: 'usernotifications'
      },
  },
 
{
  $lookup: {
      from: 'usertagsdatasharings',
      localField: '_id',
      foreignField: 'userId',
      as: 'usertagsdatasharings'
  },
},
{
  $lookup: {
      from: 'userprivacies',
      localField: '_id',
      foreignField: 'userId',
      as: 'userprivacies'
  },
},
{
  $lookup: {
      from: 'userlanguages',
      localField: '_id',
      foreignField: 'userId',
      as: 'userlanguages'
  },
},
{
  $lookup: {
      from: 'userlocations',
      localField: '_id',
      foreignField: 'userId',
      as: 'userlocations'
  },
},

]).then(data => {
    res.status(200).json(data);
}).catch(err => {
    res.status(400).json(err);
});
});

// login 
router.post("/login", (req, res) => {

    User.Auth.findOne({$or: [{"email": req.body.email}, {"phone": req.body.phone}]},(err,data)=>{

        if (err) {
            res.status(400).json({err})
        } else {
            if (data == null) {
                res.status(401).json({ error: "Username & password is not Valid" });
            } else {
                bcrypt.compare(req.body.password, data.password, function(err, result) {
                    if(err){
                        res.send("user Authentication faild");
                    }if(!data){
                        res.send("user Authentication faild");

                    }else{
                        let obj = { id: result._id, phone: result.phone };
                        let token = jwt.sign(obj, config.secrateKey, {
                            expiresIn: 7200 // expires in 30 minutes

                        });
                        let refreshToken = jwt.sign(obj, config.refreshSecrateKey, {
                            expiresIn: '14d' // expires in 14 days
                        });
                        res.cookie("access-token", token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 2});
                        res.cookie("refresh-token", refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 14 });

                        let model=new User.HistoryLogs({
                            userId:data._id,
                            loginType:data.Phone,
                            ipAddress:ip.address(),
                            status:true,
                            loginTime:new Date().toString().replace(/T/, ':').replace(/\.\w*/, '')
                        });
                        model.save((err, dt) => {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                res.json({
                                    id: data._id,
                                    phone: data.phone,
                                    email: data.email,
                                    role: data.role,
                                    token:token
                                });
                            }
                        });


                    }

                });

            }
        }
    });
});

router.post('/logout', async (req, res) => {
    const obj={
        userId:req.body.userId,
        status:true
    } ;
    try{
        const result = await User.HistoryLogs.findOne({ obj });
        if(!result){
            res.status(200).json({
                message: "Auth Failed"
            });
        } else {
            User.HistoryLogs.findOneAndUpdate()
        }
        res.clearCookie('access-token');
        res.clearCookie('refresh-token');
        res.status(200).json({
            message: "logged out successfully"
        })
    } catch(error){
        res.status(400).send(error)
    }
});

// sign-up
router.post("/signup", userMiddleware.checkExistingUser, async (req, res) => {
  
  if(!userMiddleware.validatePassword(req.body.password))
            return res.status(412).json({message: "Invalid Password. Password should between 7 to 15 characters which contain at least one numeric digit and a special character"})
 
  const encryptPassword=await bcrypt.hash(req.body.password, 10);
  req.body.password=encryptPassword;
  let model = new User.Auth(req.body);
  model.save((err, user) => {
      if (err) {
          res.send(err.message);
      } else {
          const emailSecurity = userMiddleware.emailSecurityCode();
          const phoneSecurity = userMiddleware.phoneSecurityCode();
          User.Auth.findOneAndUpdate(
            { _id: user._id },
            {
              emailSecurityCode: emailSecurity,
              phoneSecurityCode: phoneSecurity,
            },
            {
              timestamps: { createdAt: false, updatedAt: true },
            },
            (err, data) => {
              if (err) {
                res.status(400).json({err})
              } else {
                if (req.body.email) {
                  let obj = { id: data._id, email: data.email };
                  let token = jwt.sign(obj, config.secrateKey, {
                    expiresIn: 1800, // expires in 30 minuites
                  });
                  let refreshToken = jwt.sign(obj, config.refreshSecrateKey, {
                    expiresIn: "14d", // expires in 14 days
                  });
                  res.cookie("accessToken", token, {
                    maxAge: 1000 * 60 * 30,
                    sameSite: 'lax'
                  });
                  res.cookie("refreshToken", refreshToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 14,
                    sameSite: 'lax'
                  });
                  let userInfo = {
                      success: true,
                      message: "User Signed-up Successfully",
                      id: data._id,
                      email: data.email,
                      token:token,
                      role:data.role
                  };
                  const securityCodeText = "Verification Code is " + emailSecurity;
            email(
              data.email,
              "Security Code",
              securityCodeText,
              "verificationCode",
              { code: `${emailSecurity}`, userEmail: `${data.email}` }
            ).then(
              (send) => {
                res.status(200).json(userInfo);
              },
              (err) => {
                console.log(err);
                res.status(400).send(err);
              }
            );
                } else if (req.body.phone) {
                  // userMiddleware.updateSecurityCodes(data._id);
                  console.log("Phone");
                  userPhone = `+91${data.phone}`;
                  console.log(userPhone);
                  client.messages
                    .create({
                      body: `Your Verification code For artcurate is ${phoneSecurity}`,
                      messagingServiceSid: process.env.MSGSSID,
                      to: userPhone,
                    })
                    .then((messages) => console.log(messages))
                    .catch((err) => console.error(err));
                  res.status(200).send({
                    id: data._id,
                    success: true,
                    message:
                      "Registraion Successful. Verification code is sent to users mobile number",
                  });
                } else {
                  res.json(phoneSecurity || emailSecurity );
                }
              }
            }
          );
      }
  });
});


// add user name
router.put(
    "/addUserName/:id",
    userMiddleware.checkExistingUsername,
    (req, res) => {
      let id = req.params.id;
      if(!userMiddleware.validateUserName(req.body.username))
              return res.status(400).json({message: "Invalid username."})
      User.Auth.findOneAndUpdate(
        { _id: id },
        { username: req.body.username },
        {
          timestamps: { createdAt: false, updatedAt: true },
        },
        (err, data) => {
          if (err) {
            res.status(400).send(err);
          } else {
            regText = `You have Successfully registered`;
            email(
              data.email,
              "Registration Success",
              regText,
              "registrationSuccess",
              { firstName: `${data.fname || data.name}`, username: `${req.body.username}` }
            );
            res.status(200).json({
              success: true,
              message: "username added successfully",
              id: data._id
            });
          }
        }
      );
    }
  );

router.put(
  "/addlinkedUserName/:id",
  (req, res) => {
    let id = req.params.id;
    if (!userMiddleware.validateUserName(req.body.username))
      return res.status(400).json({ message: "Invalid username." })
    User.Auth.findOne({ username: req.body.username }, (err, data) => {
      if (err) {
        res.send(err.message);
      } else {
        console.log('tess22111---->', data)

        if (data) {
          let errorMsg = "";

          //need to optimize code
          errorMsg = "Username already exists.";
          let n1 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
          let n2 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
          let n3 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
          res.send({
            errorMsg,
            suggetions: { n1, n2, n3 },
          });

        } else {
          User.Auth.updateOne(
            { _id: id },
            { $addToSet: { username: [req.body.username], linkedUsers: [req.body.username] } },
            {multi: true },
            function(err, data) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.status(200).json({
                  success: true,
                  message: "username linked successfully",
                  id: data._id
                });
              }
            }
          );
  }
      }
    });
  }
);

router.put("/addRegUserName/:id", userMiddleware.checkExistingUsername, (req, res) => {
    let id = req.params.id;
    User.Register.findOneAndUpdate({ _id: id }, { username: req.body.username }, { 
        timestamps: { createdAt:false, updatedAt:true } 
    }, (err, data) => {
        if (err) {
            res.status(400).json({err})
        } else {
            res.status(200).json({data})
        }
    });
});

router.put("/addUserInfo/:id", userMiddleware.verifyToken, (req, res) => {
    let id = req.params.id;
    User.Auth.findOneAndUpdate({ _id: id }, req.body, {
        timestamps: { createdAt:false, updatedAt:true }
    }, (err, data) => {
        if (err) {
          res.status(400).json({ err });
        } else {
          res.status(200).json({ data });
        }
    });
});

router.post("/forgotPassword", (req, res) => {
    User.Auth.findOne(req.body, (err, user) => {
        if (err) {
            res.status(400).json({err})
        } else {
            if (!user) {
                res.status(404).send("No User Found");
            } else {
                const url = 'localhost:3000/user/forgotpassword?id=' + user.id;
                const resetUrlText = "Reset url is <a href='" + url + "'>" + url + "</a>";
                const resetUrlTemplate = "Reset url is <a href='" + url + "'>" + url + "</a>";

                email(user.email, 'Reset Url', resetUrlTemplate, resetUrlText).then(data => {
                    res.send(data);
                }, err => {
                    res.status(400).json({err})
                });
            }
        }
    })
});

// Active Previous Deactivated User. & Deactivate Active User.
router.put("/activeDeactivateUser/:id", (req, res) => {
    let id = req.params.id;
    let status = req.body;
    User.Auth.findById(id, (err, user) => {
        if (err) {
            res.json({
                error: err,
                message: "Id is not correct"
            });
        } else {
            if (user == null) {
                res.status(404).send("User id not found");
            } else {
                User.Auth.findOneAndUpdate({ _id: id }, status, {
                    timestamps: { createdAt:false, updatedAt:true }
                }, (err, data) => {
                    if (err) {
                        res.status(400).json({err})
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
 * Verify Phone
 *  */
router.get("/generateVarificationCode/:type/:id", userMiddleware.getUserInfo, (req, res) => {
    const type = req.params.type;      // For Mail & Send Message
    const id = req.params.id;
    const securityCode = userMiddleware.generateSecurityCode();
    const securityCodeText = "Varification Code is " + securityCode;
    const securityCodeTemplate = "<h1>Email varification code is " + securityCode + "</h1>";
    User.Auth.findOneAndUpdate({ _id: id }, { securityCode: securityCode }, {
        timestamps: { createdAt:false, updatedAt:true } 
    }, (err, user) => {
        if (err) {
            res.status(400).json({err})
        } else {
            // For Mail & Send Message
            if (type == 'email') {
                email(user.email, 'Security Code', securityCodeTemplate, securityCodeText).then(data => {
                    res.send(data);
                }, err => {
                    console.log(err);
                    res.status(400).json({err})
                });
            } else {
                res.send(securityCode);
            }
        }
    })
});

router.put("/verification/:type/:id", async (req, res) => {
  const obj = {};
  const id = req.params.id;
  const type = req.params.type;
  const emailSecurity = req.body.emailSecurityCode;
  const phoneSecurity = req.body.phoneSecurityCode;

  if (type == "email") {
    obj.emailVerified = true;
  } else {
    obj.phoneVerified = true;
  }

  await User.Auth.findById(
    id,
    { emailSecurityCode: 1, phoneSecurityCode: 1, email: 1, phone: 1 },
    (err, code) => {
      if (err) {
        res.status(400).send(err);
      } else {
        if (
          code.emailSecurityCode == emailSecurity ||
          code.phoneSecurityCode == phoneSecurity
        ) {
          User.Auth.findByIdAndUpdate(id, obj, (err, data) => {
            if (err) {
              res.status(400).send(err);
            } else {
              res.status(200).send({
                success: true,
                message: `Users ${type} has verified`,
              });
              VerificationText = `You have successfully verified your ${type}`;
              email(
                code.email,
                "Verification Success",
                VerificationText,
                "verificationSuccess",
                { verificationType: `${type}` }
              );
            }
          });
        } else {
          res.status(200).send({
            success: false,
            message: `Users ${type} has not verified. Because you have entered wrong Security Code`,
          });
        }
      }
    }
  );
});

router.put("/register/verification/:type/:id", (req, res) => {
    const obj = {};
    const id = req.params.id;
    const type = req.params.type;
    const emailSecurity = req.body.emailSecurityCode;
    const phoneSecurity = req.body.phoneSecurityCode;

    if (type == "email") {
        obj.emailVerified = true;
    } else {
        obj.phoneVerified = true;
    }

    User.Register.findById(id, { emailSecurityCode: 1, phoneSecurityCode: 1 }, (err, code) => {
        if (err) {
            res.status(400).send(err);
        } else {
            if (code.emailSecurityCode == emailSecurity || code.phoneSecurityCode == phoneSecurity) {
                User.Register.findByIdAndUpdate(id, obj, (err, data) => {
                    if (err) {
                        res.status(400).json({err})
                    } else {
                        res.status(200).send({
                            success: true,
                            message: `Users ${type} has verified`
                        });
                    }
                });
            } else {
                res.status(200).send({
                    success: false,
                    message: `Users ${type} has not verified. Because you have entered wrong Security Code`
                });
            }
        }
    });
});

/**
 * Insert User Details
 *  */
// Insert Logged in User Details
router.post("/insertUserDetails", userMiddleware.verifyToken, (req, res) => {
    let obj = req.body;
    let model = new User.Details(obj);
    model.save((err, user) => {
        if (err) {
            res.status(400).send(err);
        } else {
            res.send(user);
        }
    })
});

// Get Logged in User Details
router.get("/userDetails/:id", userMiddleware.verifyToken, (req, res) => {
    let id = req.params.id;
    User.Details.findOne({ userId: id }, (err, data) => {
        if (err) {
            res.status(400).json({err})
        } else {
            res.status(200).json({data})
        }
    });
});

router.get("/listUsers/:name", userMiddleware.verifyToken, (req, res) => {
  User.Auth.findOne({ username: req.params.name }, (err, data) => {
    if (err) {
      res.send(err.message);
    } else {
      if (data) {
        res.send(data);

      } else {
        res.status(200).json({
          success: true,
          message: "No users found",
        });
      }
    }
  });
});

router.get("/getlinkedUsers/:id", userMiddleware.verifyToken, async (req, res) => {
  User.LinkedUsers.find({ linkWith: ObjectId(req.params.id) }, async (err, data) => {
    if (err) {
      res.send(err.message);
    } else {
      if (data) {
        var ids = data.map(function (item) { return item.user; });
        User.Auth.find({ _id: { $in: ids } }, function (err, user) {
          res.send(user);
        });
      }
    }
  });
});
// Update User Details
router.put("/updateUserDetails/:id", userMiddleware.verifyToken, (req, res) => {
    const id = req.params.id;
    const obj = req.body;
    User.Details.findOneAndUpdate({ userId: id }, obj, { 
        timestamps: { createdAt:false, updatedAt:true } 
    }, (err, data) => {
        if (err) {
            res.status(400).json({err})
        } else {
            res.send("Data Updated Successfully");
        }
    });
});


/**
 * Insert User Group
 *  */
// Insert Logged in User Group
router.post("/addUserGroup", userMiddleware.verifyToken, (req, res) => {
    let obj = req.body;
    let model = new User.Group(obj);
    model.save((err, user) => {
        if (err) {
            res.status(400).json({err})
        } else {
            res.send('User Data Inserted');
        }
    })
});

// router.post("/linkUser", userMiddleware.verifyToken, (req, res) => {
//   let obj = req.body;
//   let model = new User.LinkedUsers(obj);
//   User.LinkedUsers.findOne({ user: req.body.user }, (err, data) => {
//     if (err) {
//         res.status(400).json({err})
//     } else {
//       if(data){
//         res.send({
//           message: "User already linked with another account"
//         });
//       }else{
//         model.save((err, user) => {
//           if (err) {
//               res.status(400).json({err})
//           } else {
//               res.send('Data Linked');
//           }
//       })
//       }
//     }
// });

// });
router.post("/linkUser", userMiddleware.verifyToken, (req, res) => {
  let obj = req.body;
  let model = new User.LinkedUsers(obj);
    User.Auth.updateOne(
      { _id: req.body.id },
      { $addToSet: { linkedUsers: [req.body.linkedUsers]} },
      function(err, data) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).json({
            success: true,
            message: "username linked successfully",
            id: data._id
          });
        }
      }
    );
  // User.LinkedUsers.findOne({ user: req.body.user }, (err, data) => {
  //   if (err) {
  //       res.status(400).json({err})
  //   } else {
  //     if(data){
  //       res.send({
  //         message: "User already linked with another account"
  //       });
  //     }else{
  //       model.save((err, user) => {
  //         if (err) {
  //             res.status(400).json({err})
  //         } else {
  //             res.send('Data Linked');
  //         }
  //     })
  //     }
  //   }


  // });

});
// Get Logged in User Group
router.get("/userGroup/:id", userMiddleware.verifyToken, (req, res) => {
    let id = req.params.id;
    User.Group.findOne({ userId: id }, (err, data) => {
        if (err) {
            res.status(400).json({err})
        } else {
            res.send(data);
        }
    });
});

router.post('/uploadProfilePics/:id', userMiddleware.verifyToken, upload.single("profile"), uploadMiddleware.uploadImage, (req, res) => {
    let obj = {
        userId: req.params.id,
        profilePics: req.file.originalname
    }
    let model = new User.ProfilePics(obj);
    model.save((err, profile) => {
        if (err) {
            res.status(400).json({err})
        } else {
            res.json('Profile picture uploaded successfully');
        }
    });
});

router.post('/sendSms', (req, res) => {
    let name = "ArtCurate";

    const params = new URLSearchParams();
    params.append("numbers", [parseInt("91" + 9845098450)]);
    params.append(
        "message",
        `Hi ${name}, Welcome to Artcurate`
    );
    tlClient.post("/send", params).then(resp => {
        console.log("Success Send");
        // resolve(res);
        res.send(resp);
    }).catch(err => {
        console.log(err);
        res.status(400).json({err})
        // reject(err);
    });
    
    phone.sendMessage(obj).then(data => {
        console.log("Success");
        res.send(data);
    }, err => {
        console.log("Error");
        res.status(400).json({err})
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
                res.status(200).json({
                    accessToken: token,
                    refreshToken: refreshToken
                });     
            }
        });
    }
});

router.post(
    "/register",
    (req, res) => {
        const pwd = Math.random().toString(36).slice(-8);
        obj = req.body;
        details = {...obj ,password: pwd}
      let model = new User.Register(details);
      model.save((err, user) => {
        if (err) {
          res.send(err.message);
        } else {
            const emailSecurity = userMiddleware.emailSecurityCode();
            const phoneSecurity = userMiddleware.phoneSecurityCode();
          User.Register.findOneAndUpdate(
            { _id: user._id },
            {
            emailSecurityCode: emailSecurity,
            phoneSecurityCode: phoneSecurity
            },
            {
              timestamps: { createdAt: false, updatedAt: true },
            },
            (err, data) => {
              if (err) {
                res.status(400).json({err})
              } else {
                if (req.body.email) {
                  let userInfo = {
                    success: true,
                    message: "User Registered Successfully",
                    id: data._id,
                    email: data.email,
                  };
                  const securityCodeText = "Verification Code is " + emailSecurity;
                  const securityCodeTemplate =
                    "<h1>Your artcurate verification code is " +
                    emailSecurity +
                    "</h1>";
                  email(
                    data.email,
                    "Security Code",
                    securityCodeTemplate,
                    securityCodeText
                  ).then(
                    (send) => {
                      // res.send(data);
                      res.status(200).json(userInfo);
                    },
                    (err) => {
                      console.log(err);
                      res.status(400).send(err);
                    }
                  );
                } else if (req.body.phone) {
                  console.log("Phone");
                  userPhone = `+91${data.phone}`
                  console.log(userPhone);
                  client.messages
                    .create({
                      body: `Your Verification code for artcurate is ${phoneSecurity}`,
                      messagingServiceSid: process.env.MSGSSID,
                      to: userPhone,
                    })
                    .then((messages) => console.log(messages))
                    .catch((err) => console.error(err));
  
                  res.status(200).send({ 
                    id: data._id,
                    success: true,
                    message: "Verification code is sent to users mobile number"
                });
                } else {
                  res.json(emailSecurity,phoneSecurity);
                }
              }
            }
          );
        }
      });
    }
  );

/* Google Authentication */

router.post("/auth/googlelogin", async (req, res) => {
    const {tokenId} = req.body;

    googleClient.verifyIdToken({idToken: tokenId, audience:process.env.GOOGLE_CLIENT_ID})
        .then(response => {
            // console.log(response.payload);
            const {name, email, email_verified} = response.payload;
            if(email_verified) {
                User.Auth.findOne({email}).exec(async (err, user) => {
                    if(err) {
                        return res.status(400).json({error: "Something went wrong..."});
                    } else {
                        if(user) {
                            // User already exists in DB
                            const token = jwt.sign({_id: user._id}, config.secrateKey, {expiresIn: '10d'});
                            const {_id, name, email} = user;

                            res.status(200).json({token, user: {_id, name, email}});
                        } else {
                            // Create new user
                            const fname = name.split(' ').slice(0, 1).join(' ');
                            const lname = name.split(' ').slice(-1).join(' ');
                            const password = Math.random().toString(36).slice(-8);
                            const userCategory = req.body.userCategory;
                            const hashedPassword = await bcrypt.hash(password, 10);
                            const emailVerified = req.body.emailVerified;

                            const newUser = new User.Register({fname, lname, email, userCategory, password: hashedPassword, emailVerified});
                            newUser.save((err, data) => {
                                if(err) {
                                    return res.status(400).json({error: "Something went wrong..."});
                                } else {
                                    const token = jwt.sign({_id: data._id}, config.secrateKey, {expiresIn: '7d'});
                                    const {_id, fname, lname, email, userCategory} = newUser;

                                    res.status(200).json({token, user: {_id, fname, lname, email, userCategory}});
                                }
                            });

                        }
                    }
                })
            }
        });
});

/* Facebook Authentication */

router.post("/auth/facebooklogin", async(req, res) => {
    const accessToken = req.body.accessToken;
    const userID = req.body.userID;
    
    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    fetch(urlGraphFacebook, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(response => {
        const {email, name} = response;
        User.Auth.findOne({email}).exec(async (err, user) => {
            if(err) {
                return res.status(400).json({error: "Something went wrong..."});
            } else {
                if(user) {
                    // User already exists in DB
                    const token = jwt.sign({_id: user._id}, config.secrateKey, {expiresIn: '10d'});
                    const {_id, name, email} = user;

                    res.status(200).json({token, user: {_id, name, email}});
                } else {
                    // Create new user
                    const fname = name.split(' ').slice(0, 1).join(' ');
                    const lname = name.split(' ').slice(-1).join(' ');
                    const password = Math.random().toString(36).slice(-8);
                    const userCategory = req.body.userCategory;
                    const hashedPassword = await bcrypt.hash(password, 10);

                    const newUser = new User.Register({fname, lname, email, userCategory, password: hashedPassword});
                    newUser.save((err, data) => {
                        if(err) {
                            return res.status(400).json({error: "Something went wrong..."});
                        } else {
                            const token = jwt.sign({_id: data._id}, config.secrateKey, {expiresIn: '10d'});
                            const {_id, fname, lname, email, userCategory} = data;

                            res.status(200).json({token, user: {_id, fname, lname, email, userCategory}});
                        }
                    });

                }
            }
        });
    }).catch((err) => res.send(400).json(err));
});

router.post(
    "/checkUserNameAvailability/:id",
    userMiddleware.checkExistingUsername,
    (req, res) => {
      let id = req.params.id;
      User.Auth.findOne(
        { _id: id },
        (err, data) => {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(200).json({
              success: true,
              message: "username is available",
              id: data._id
            });
          }
        }
      );
    }
  );
  router.get(
    "/userNameAvailabiity/:id",
    (req, res) => {
      let id = req.params.id;
      console.log("🚀 ~ file: controller.js ~ line 960 ~ User.Auth.findOne ~ req.body.username", req.body)

      User.Auth.findOne({ username: req.body.username }, (err, data) => {
        if (err) {
          res.send(err.message);
        } else {
          if (data) {
            console.log("🚀 ~ file: controller.js ~ line 940 ~ User.Auth.findOne ~ data", data)
            let errorMsg = "";
              //need to optimize code
              errorMsg = "Username is already exists.";
             let n1 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
             let n2 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
             let n3 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
            res.send({
              errorMsg,
              suggetions: { n1, n2, n3 },
            });
  
          } else {
            res.status(200).json({
              success: true,
              message: "username is available",
            });
          }
        }
      });
    }
  );

router.get("/resendVerificationCode/:type/:id", (req, res) => {
  const type = req.params.type; // For Mail & Send Message
  const id = req.params.id;
  const emailSecurity = userMiddleware.emailSecurityCode();
  const phoneSecurity = userMiddleware.phoneSecurityCode();
  const securityCodeText = "Verification Code is " + emailSecurity;
  User.Auth.findOneAndUpdate(
    { _id: id },
    { emailSecurityCode: emailSecurity, phoneSecurityCode: phoneSecurity },
    {
      timestamps: { createdAt: false, updatedAt: true },
    },
    (err, user) => {
      if (err) {
        res.status(400).json({err})
      } else {
        // For Mail & Send Message
        if (type == "email") {
          email(
            user.email,
            "Security Code",
            securityCodeText,
            "verificationCode",
            { code: `${emailSecurity}`, userEmail: `${user.email}` }
          ).then(
            (data) => {
              res.send({
                success: true,
                message: "Verification Code has been sent your Email id",
              });
            },
            (err) => {
              console.log(err);
              res.status(400).json({err})
            }
          );
        } else if (type == "phone") {
          userPhone = `+${user.phone}`;
          console.log(userPhone);
          client.messages
            .create({
              body: `Your Verification code For artcurate is ${phoneSecurity}`,
              messagingServiceSid: process.env.MSGSSID,
              to: userPhone,
            })
            .then(
              (data) => {
                res.status(200).send({
                  success: true,
                  message: "Verification Code has been sent your Phone Number",
                });
              },
              (err) => {
                console.log(err);
                res.status(400).json({err})
              }
            );
        } else {
          res.send(emailSecurity, phoneSecurity);
        }
      }
    }
  );
});

router.put("/addEmail/:id", (req, res) => {
    let id = req.params.id;
    const emailSecurity = userMiddleware.emailSecurityCode();
    const securityCodeText = "Verification Code is " + emailSecurity;
    if(!userMiddleware.validateEmail(req.body.email))
          return res.status(400).json({message: "Invalid Email."})
    User.Auth.findOneAndUpdate(
      { _id: id },
      { email: req.body.email, emailSecurityCode: emailSecurity },
      {
        timestamps: { createdAt: false, updatedAt: true },
      },
      (err, data) => {
        if (err) {
          res.status(400).send(err);
        } else {
          email(
            req.body.email,
            "Security Code",
            securityCodeText,
            "verificationCode",
            { code: `${emailSecurity}`, userEmail: `${req.body.email}` }
          );
          res.status(200).json({
            id: data._id,
            success: true,
            message: "Email Added Successfully",
          });
        }
      }
    );
  });

router.put("/addPhone/:id", (req, res) => {
  let id = req.params.id;
  const phoneSecurity = userMiddleware.phoneSecurityCode();
  if(!userMiddleware.validatePhone(req.body.phone))
          return res.status(400).json({message: "Invalid Mobile Number."});
  User.Auth.findOneAndUpdate(
    { _id: id },
    { phone: req.body.phone, phoneSecurityCode: phoneSecurity },
    {
      timestamps: { createdAt: false, updatedAt: true },
    },
    (err, data) => {
      if (err) {
        res.status(400).send(err);
      } else {
        userPhone = `${data.phone}`;
        console.log(userPhone);
        client.messages
          .create({
            body: `Your Verification code For artcurate is ${phoneSecurity}`,
            messagingServiceSid: process.env.MSGSSID,
            to: userPhone,
          })
          .then((messages) => console.log(messages))
          .catch((err) => console.error(err));
        res.status(200).json({
          id: data._id,
          success: true,
          message: "Phone Added Successfully",
        });
      }
    }
  );
});

/**
 * Get Primary Roles
 * userMiddleware.verifyToken
 */
router.get('/getPrimaryRoles/:category', async (req,res) =>{

  let category = _.toLower(req.params.category);

  await adminModel.UserCategory.findOne({ category }, (err, data) => {

    if (err) {
      res.status(400).send(err.message);
    }else {

      if(data) {

        if(data.category === category) {

          res.status(200).json({
            success: true,
            primaryRole: data.primaryRole
          });
        }
      } else {

        res.status(400).send({
          success: false,
          message: "Oops! You have entered incorrect main role"
        });
      }
    }
  });
});

/**
 * Get Secondary Roles
 * userMiddleware.verifyToken
 */
router.get('/getSecondaryRoles', userMiddleware.verifyToken, async (req,res) =>{

  let category = "artist";

  await adminModel.UserCategory.findOne({ category }, (err, data) => {

    if (err) {
      res.status(400).send(err.message);
    }else {

      if(data) {

        if(data.category === category) {

          res.status(200).json({
            success: true,
            secondaryRole: data.secondaryRole
          });
        }
      } else {

        res.status(400).send({
          success: false,
          message: "Oops! Something went wrong"
        });
      }
    }
  });
});

/**
 * Add User Roles (Primary, Secondary)
 * userMiddleware.verifyToken
 */
router.put('/addUserRoles/:id', userMiddleware.verifyToken, (req, res) => {

  let id = req.params.id;

  User.Auth.findOneAndUpdate({ _id: id }, {
    primaryRole: req.body.primaryRole,
    secondaryRole: req.body.secondaryRole
  }, { timestamps: { createdAt: false, updatedAt: true } }, (err, data) => {

    if (err) {
      res.status(400).send(err.message);
    } else {

      if (data) {

        res.status(200).json({
          success: true,
          message: "User Roles Added Successfully"
        });
      } else {

        res.status(400).send({
          success: false,
          message: "Oops! Something went wrong while adding roles"
        });
      }
    }
  });
});

/**
 * User Profile
 */
router.get('/profile/:id', (req, res)=> {

  let id = req.params.id;

  
  User.Auth.aggregate(
    [
      {
        $match : { _id: ObjectId(id) }
      },
      {
        $lookup : {
          from: "userdetails",
          localField: "_id",
          foreignField: "userId",
          as: "userdetails"
        }
      },
      {
        $project : {
          _id: 0,
          emailVerified: 1,
          phoneVerified: 1,
          name: 1,
          fname: 1,
          lname: 1,
          email: 1,
          phone: 1,
          role: 1,
          primaryRole: 1,
          secondaryRole: 1,
          "userdetails.address": 1,
          "userdetails.about": 1
        }
      }
    ], (err, data) => {

      if(err) {
        res.send(err.message);
      } else {

        if(data) {
          data.map((item) => res.status(200).send(item));
        } else {
          res.status(400).json({
            message: "Something Went Wrong! Try Again."
          });
        }
      }
    }
  );
});

/**
 * User Profile Update User Details
 */
router.put('/updateProfile/:id', (req, res) => {

  let id = req.params.id;
  let obj = req.body;

  User.Auth.aggregate(
    [
      {
        $match : { _id : ObjectId(id) }
      },
      {
        $project : { _id: 0, role: 1 }
      }
    ], (err, role) => {

      if(err) {
        res.json(err.message);
      } else {

        if(role) {

          let category = role.map((item) => item.role);
          let name = obj.name;
          let fname = obj.fname;
          let lname = obj.lname;
          
          if(_.toLower(category) == "artist" | _.toLower(category) == "enthusiast") {
  
            User.Auth.findOneAndUpdate(
              { _id : ObjectId(id) },
              {
                fname,
                lname,
                primaryRole : obj.professional,
                secondaryRole : obj.subRoles
              },
              (err, data) => {
                if(err) {
                  res.json(err.message);
                }
              }
            );
          } else {
  
            User.Auth.findOneAndUpdate(
              { _id : ObjectId(id) },
              {
                name,
                primaryRole : obj.professional,
                secondaryRole : obj.subRoles
              },
              (err, data) => {
                if(err) {
                  res.json(err.message);
                }
              }
            );
          }

          User.Details.findOneAndUpdate(
            { userId : ObjectId(id) },
            {
              about : obj.about,
              address : obj.city
            },
            (err, data) => {
              if(err) {
                res.json(err.message);
              } else {
                
                if(data) {
                  res.status(200).json({
                    success: true,
                    message: "User Profile Details Updated Successfully"
                  });
                } else {
                  res.status(400).json({
                    success: false,
                    message: "Something Went Wrong! Try Again."
                  })
                }
              }
            }
          );
        }
      }
    }
  );
});

// Gorisab's code
// router.put(
//   "/addUserMainRole/:id/:role",
//   userMiddleware.checkExistingUsername,
//   userMiddleware.verifyToken,
//   (req, res) => {
//     let id = req.params.id;
//     User.Auth.findOneAndUpdate(
//       { _id: id },
//       { primaryRole: req.params.role },
//       {
//         timestamps: { createdAt: false, updatedAt: true },
//       },
//       (err, data) => {
//         if (err) {
//           res.status(400).json({ err });
//         } else {
//           res.json({ success: true, message: "User main role added" });
//         }
//       }
//     );
//   }
// );

// router.put(
//   "/addUserSubRoles/:id",
//   userMiddleware.checkExistingUsername,
//   userMiddleware.verifyToken,
//   (req, res) => {
//     let id = req.params.id;
//     User.Auth.findOneAndUpdate(
//       { _id: ObjectId(id) },
//       { $addToSet: { secondaryRole: req.body.subroles } },
//       {
//         timestamps: { createdAt: false, updatedAt: true },
//       },
//       (err, data) => {
//         if (err) {
//           res.status(400).json({ err });
//         } else {
//           res.json({ success: true, message: "User sub roles added" });
//         }
//       }
//     );
//   }
// );

// router.get('/profile/:user', (req,res)=> {
//   User.Register.findOne({ username: req.params.user }, (err, data) => {
//     if (err) {
//         res.status(400).json({err});
//     } else {
//         if (data) {
//             if (data.username == req.params.user) {
//             }
//             res.status(200).json({
//                 success: true,
//                 message: "User profile exists",
//                 profileDetails: {
//                     firstName: data.fname,
//                     lastName: data.lname,
//                     role: data.role,
//                     Languages: data.languages
//                 }
//             });
//         } else {
//             res.status(400).send({
//                 success: false,
//                 message: "User profile Doesn't exists",
//             });
//         }
//     }
//   });
// });

router.post("/addLocation", userMiddleware.verifyToken, (req,res)=>{
  let obj = req.body;
  let model = new User.Details(obj);
  model.save((err, user) => {
      if (err) {
          res.status(400).json({err});
      } else {
          res.status(200).json({
            success: true,
            message: "User Location Added",
            id: user._id,
          });
      }
  })
});

router.post("/addUserLocation", userMiddleware.verifyToken, (req,res)=>{
  let obj = req.body;
  let model = new User.userloaction(obj);
  model.save((err, user) => {
      if (err) {
          res.status(400).json({err});
      } else {
          res.status(200).json({
            success: true,
            message: "User Location Added",
          });
      }
  })
});

// Get Search Locations
router.get("/searchLocation", userMiddleware.verifyToken, (req,res) =>{
  let searchKey = req.query.search;
  let searchObject = {
    $or: [
      {
        address: {
          $regex: searchKey,
          $options: "is",
        },
      },
      {
        city: {
          $regex: searchKey,
          $options: "is",
        },
      },
    ],
  };
  User.Details.aggregate(
    [
      { $match: { ...searchObject } },
    ], (err,data) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err.message
      })
    }else {
      res.status(200).json({ message: "User locations", data: data });
    }
  })
});

/**
 * Profile Settings > Settings > Notifications
 */
router.get('/getNotifications/:userId', async (req, res) => {

  try {
    const userId = req.params.userId;
    const result = await User.Notification.findOne({ userId },{ _id:0, userId:0, createdAt:0, updatedAt:0 });
    if(!result){
        
        res.status(400).send({error:"errorr"});
    }
    else{
        res.status(200).json({
            success: true,
            data: result
        });
        
    }
  } catch (error) {
      res.status(400).send(error.message);
  }
});

router.post('/pauseAll', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = { userId : req.body.userId };

  if(req.body.isPauseAll != true) {

    const resSettingData = {
      userId : req.body.userId,
      isPauseAll : req.body.isPauseAll,
      isEmailNotification : 1,
      isWhatsappNotification : 1,
      isRequestReceived : 1,
      isRequestAccepted : 1,
      isStudentOnly : 1
    };

    User.Notification.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json({
          data: result,
          message: "your All notification is on"
        });
      }
    });

  } else {
    const resSettingData = {
      userId : req.body.userId,
      isPauseAll : req.body.isPauseAll,
      isEmailNotification : 0,
      isWhatsappNotification : 0,
      isRequestReceived : 0,
      isRequestAccepted : 0,
      isStudentOnly : 0
    };
    
    User.Notification.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json({
          data: result,
          message: "your all notification is off"
        });
      }
    });
  }
});

router.post('/emailNotification', (req, res) => {

  const options = { upsert:true, new:true, setDefaultsOnInsert:true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isEmailNotification : req.body.isEmailNotification };
  User.Notification.findOneAndUpdate(resSettingFilter, resSettingData, options, (error,result)=>{
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        success: true,
        message: "success",
      });
    }
  });
});

router.post('/whatsappNotification', (req, res) => {

  const options = { upsert:true, new:true, setDefaultsOnInsert:true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isWhatsappNotification : req.body.isWhatsappNotification };
  User.Notification.findOneAndUpdate(resSettingFilter, resSettingData, options, (error,result)=>{
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        success: true,
        message: "success",
      });
    }
  });
});

router.post('/requestReceived', (req, res) => {

  const options = { upsert:true, new:true, setDefaultsOnInsert:true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isRequestReceived : req.body.isRequestReceived };
  User.Notification.findOneAndUpdate(resSettingFilter, resSettingData, options, (error,result)=>{
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        success: true,
        message: "success",
      });
    }
  });
});

router.post('/requestAccepted', (req, res) => {

  const options = { upsert:true, new:true, setDefaultsOnInsert:true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isRequestAccepted : req.body.isRequestAccepted };
  User.Notification.findOneAndUpdate(resSettingFilter, resSettingData, options, (error,result)=>{
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        success: true,
        message: "success",
      });
    }
  });
});

router.post('/studentAccountOnly', (req, res) => {

  const options = { upsert:true, new:true, setDefaultsOnInsert:true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isStudentOnly : req.body.isStudentOnly };
  User.Notification.findOneAndUpdate(resSettingFilter, resSettingData, options, (error,result)=>{
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        success: true,
        message: "success",
      });
    }
  });
});


/**
 * Profile Settings > Settings > Tags & Data Sharing
 */
router.get('/getTagsData/:userId', async (req, res) => {

  try {
    const userId = req.params.userId;
    const result = await User.TagsDataSharing.findOne({ userId }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result){
      res.status(400).send(error.message);
    }
    else{
      res.status(200).json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/reviewTags', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isReviewTags : req.body.isReviewTags };

  User.TagsDataSharing.findOneAndUpdate(resSettingFilter, resSettingData, options, (error,result) => {
    if (error) {
    res.status(500).send(error);
    } else {
      res.status(200).json({
        success: true,
        message: "success",
      });
    }
  });
});

router.post('/collabRequest', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isCollaborationRequest : req.body.isCollaborationRequest };

  User.TagsDataSharing.findOneAndUpdate(resSettingFilter, resSettingData, options, (error,result) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        success: true,
        message: "success",
      });
    }
  });
});


/**
 * Profile Settings > Settings > Privacy
 */
router.get('/getPrivacyData/:userId', async (req, res) => {

  try {
    const userId = req.params.userId;
    const result = await User.Privacy.findOne({ userId }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result){
      res.status(200).json({
        data: result,
        message: "No data found!",
      });
    }
    else{
      res.status(200).json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/privateAccount', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = { userId : req.body.userId };

  if(req.body.isPrivateAccount != true) {

    const resSettingData = {
      userId : req.body.userId,
      isPrivateAccount : req.body.isPrivateAccount,
      SupporterOrSubscriber : 0,
      isSupporter : 0,
      isSubscriber : 0,
      isVisibility : 0,
      isBuyers : 0,
      post : "Anyone", artSocial : "Anyone", journal : "Anyone",
      canComment : "Anyone", canTag : "Anyone", canMention : "Anyone"
    };

    User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: "success"
        });
      }
    });
  }
  else{
    const resSettingData = {
      userId : req.body.userId,
      isPrivateAccount : req.body.isPrivateAccount,
      SupporterOrSubscriber : 0,
      isSupporter : 0,
      isSubscriber : 0,
      isVisibility : 0,
      isBuyers : 0,
      post : "Only Me", artSocial : "Only Me", journal : "Only Me",
      canComment : "Only Me", canTag : "Only Me", canMention : "Only Me"
    };

    User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            success: true,
            data: result,
            message: "success"
          });
        }
    });
  }
});

router.post("/supOrSub", async (req, res) => {

  try {
    const options = { upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, SupporterOrSubscriber : req.body.SupporterOrSubscriber };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error,result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            data: result.SupporterOrSubscriber,
            message: "success"
          });
        }
      });
       
    } else {
      if(result.isPrivateAccount ==true) {
        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              data: result,
              message: "success"
            });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/supporter', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = {userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isSupporter : req.body.isSupporter, isSubscriber : req.body.isSubscriber };

  User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.status(200).json({
        isSupporter: result.isSupporter,
        isSubscriber: result.isSubscriber,
        message: "success"
      });
    }
  });
});

router.post('/subscriber', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isSubscriber : req.body.isSubscriber, isSupporter : req.body.isSupporter };

  User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        Subscriber: result.isSubscriber,
        isSupporter: result.isSupporter,
        message: "success"
      });
    }
  });
});

router.post('/visibility', async (req, res) => {

  try {
    const options = { upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, isVisibility : req.body.isVisibility };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            isVisibility: result.isVisibility,
            message: "success"
          });
        }
      });
       
    } else {
      if(result.isPrivateAccount == true) {

        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              data: result,
              message: "success"
            });
          }
        });
      }
        
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/buyers', async (req, res) => {

  try {
    const options = { upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, isBuyers : req.body.isBuyers };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            isBuyers: result.isBuyers,
            message: "success"
          });
        }
      });
       
    } else {
      if(result.isPrivateAccount == true) {
        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
              res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              data: result,
              message: "success"
            });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/viewable/posts', async (req, res) => {

  try {
    const options = { upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, post : req.body.post };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            post: result.post,
            message: "success"
          });
        }
      });
       
    } else {
      if(result.isPrivateAccount == true) {
        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options,(error,result)=>{
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              data: result,
              message: "success"
            });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/viewable/artSocial', async (req, res) => {

  try {
    const options = {upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, artSocial : req.body.artSocial };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            artSocial: result.artSocial,
            message: "success"
          });
        }
      });
       
    } else {
      if(result.isPrivateAccount == true) {
        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              artSocial: result.artSocial,
              message: "success"
            });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/viewable/journal', async (req, res) => {

  try {
    const options = { upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, journal : req.body.journal };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            journal: result.journal,
            message: "success"
          });
        }
      });
       
    } else {
      if(result.isPrivateAccount == true) {
        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              journal: result.journal,
              message: "success"
            });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/canComment', async (req, res) => {

  try {
    const options = { upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, canComment : req.body.canComment };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            canComment: result.canComment,
            message: "success"
          });
        }
      });
       
    } else {
      if(result.isPrivateAccount == true) {
        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              canComment: result.canComment,
              message: "success"
            });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/canTag', async (req, res) => {

  try {
    const options = { upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, canTag : req.body.canTag };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.status(200).json({
            canTag: result.canTag,
            message: "success"
          });
        }
      });
       
    } else {
      if(result.isPrivateAccount == true) {
        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              canTag: result.canTag,
              message: "success"
            });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/canMention', async (req, res) => {

  try {
    const options = { upsert : true, new : true, setDefaultsOnInsert : true };
    const resSettingFilter = { userId : req.body.userId };
    const resSettingData = { userId : req.body.userId, canMention : req.body.canMention };
    const result = await User.Privacy.findOne({ resSettingFilter }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result) {
        
      User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              canMention: result.canMention,
              message: "success"
            });
          }
      });
       
    } else {
      if(result.isPrivateAccount == true) {
        res.status(200).json({
          success: false,
          message: "Account is private"
        });
      } else {
        User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.status(200).json({
              success: true,
              canMention: result.canMention,
              message: "success"
            });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * Profile Settings > Settings > Privacy > Blocked Accounts
 */
router.get('/getBlockedList/:userId', (req, res) => {

  const userId = req.params.userId;

    User.Block.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'blockId',
          foreignField: '_id',
          as: 'user'
        }
      }, 
      
      {
        $lookup: {
          from: 'userProfilePics',
          localField: 'blockId',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      {
        $project: {
          userId: 1,
          blockId: 1,
          'user.fname': 1,
          'user.lname': 1,
          'profile.profilePics': 1
        }
      },
      
      { $unset: "_id" },
      {
        $match: {
          userId: ObjectId(userId)
        }
      }
    ])
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

router.post('/blockAccount', (req, res) => {

  try {
    const user = new User.Block(req.body);

    user.save((err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        res.status(200).json({
          success: true,
          message: "You Blocked this user"
        });
      }
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete('/unblockAccount/:userId/:blockId', (req, res) => {

  const userId = req.params.userId;
  const blockId = req.params.blockId;

  User.Block.findOneAndDelete({ userId, blockId }, (err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json("You Unblocked this user");
    }
  });
});


/**
 * Profile Settings > Settings > Language
 */
router.get('/getAllLanguages', async (req, res) => {

  try {
    const result = await adminModel.Language.find({}, { createdAt: 0 });

    if(!result){
      res.status(200).json({
        data: result,
        message: "No data found !!"
      });
    }
    else{
      res.status(200).json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/getLanguage/:userId', (req, res) => {

  const userId = req.params.userId;

  User.Language.aggregate([
    {
      $lookup: {
        from: 'languages',
        localField: 'languageId',
        foreignField: '_id',
        as: 'languageData'
      }
    }, 
    {
      $project: {
        _id: 0,
        userId: 1,
        'languageData._id': 1,
        'languageData.languages': 1
      }
    },
    {
      $match: {
        userId: ObjectId(userId)
      }
    }
  ])
  .then(data => {
    res.status(200).json(data);
  })
  .catch(err => {
    res.status(400).json(err);
  });
});

router.post('/addLanguage', (req, res) => {

  console.log(req.body);

  let model = new User.Language(req.body);

  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        message: "Successfully Added Languages",
        result: data
      });
  }
  });
});

router.post('/education', (req, res) => {

  console.log(req.body);

  let model = new User.UserEducation(req.body);

  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        message: "Successfully Added education",
        result: data
      });
  }
  });
});

router.post('/certification', (req, res) => {

  console.log(req.body);

  let model = new User.UserCertification(req.body);

  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        message: "Successfully Added certification",
        result: data
      });
  }
  });
});


router.post('/work/exp', (req, res) => {

  console.log(req.body);

  let model = new User.UserWorkExperience(req.body);

  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        message: "Successfully Added experience",
        result: data
      });
  }
  });
});

router.post('/skills', (req, res) => {

  console.log(req.body);

  let model = new User.UserSkills(req.body);

  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        message: "Successfully Added skills",
        result: data
      });
  }
  });
});
router.post('/awards', (req, res) => {

  console.log(req.body);

  let model = new User.UserAwards(req.body);

  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        message: "Successfully Added skills",
        result: data
      });
  }
  });
});
router.post('/patents', (req, res) => {

  console.log(req.body);

  let model = new User.UserPatent(req.body);

  model.save((err, data) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.status(200).json({
        message: "Successfully Added patent",
        result: data
      });
  }
  });
});
/**
 * Profile Settings > Settings > Location
 */
router.get('/getLocationData/:userId', async (req, res) => {

  try {
    const userId = req.params.userId;
    const result = await User.Location.findOne({ userId }, { _id:0, userId:0, createdAt:0, updatedAt:0 });

    if(!result){
      res.status(200).json({
        data:result,
        message: "No data found!",
      });
    }
    else{
      res.status(200).json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/appLocation', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isUsingApp : req.body.isUsingApp };

  User.Location.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        isUsingApp: result.isUsingApp,
        message: "success"
      });
    }
  });
});

router.post('/mapLocation', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = {userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isAllowMap : req.body.isAllowMap };

  User.Location.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json({
        isAllowMap: result.isAllowMap,
        message: "success"
      });
    }
  });
});

/**
 * Profile Settings > Account
 */

// Change Password
router.post('/changePassword', async (req, res) => {

  const userId = req.body.userId;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  User.Auth.findById(userId, (err, user) => {

    if (err) {
      res.json({
        error: err,
        message: "Something Went Wrong!"
      });
    } else {

      if (user == null) {
        res.status(404).send("UserId not found");
      } else {

        bcrypt.compare(oldPassword, user.password, function(err, data) {

          if(err) {
            res.send("User Authentication Failed");
          }

          if(!data) {
            res.send("Incorrect Old Password");
          } else {

            User.Auth.findOneAndUpdate({ _id: userId }, { password : hashedNewPassword }, {
              timestamps: { createdAt:false, updatedAt:true }
            }, (err, data) => {

              if (err) {
                res.send(err.message);
              } else {

                regText = "Password Updated Successfully";

                email(
                  data.email,
                  "Password Successfully Changed",
                  regText,
                  "changePassword",
                  { username: `${data.username}` }
                ).then(send => {
                  res.status(200).json({
                    success: true,
                    message: "Mail Sent/ Password Updated"
                  });
                })
                .catch(err => {
                  res.status(400).send(err.message);
                });
              }
            });
          }
        });
      }
    }
  });
});

// Joining Date
router.get('/getJoiningdate/:userId', async (req, res) => {

  const userId = req.params.userId;

  try {
    const result = await User.Auth.findOne({ _id: userId });
    
    if(!result){
      res.status(200).json({
        data: result,
        message: "No data found!!"
      });
    } else {
      res.status(200).json({
        success: true,
        data: result.createdAt
      });
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// History Logs
router.get('/getAllHistorylogs/:userId', async (req, res) => {

  const userId = req.params.userId;

  try {
    const result = await User.HistoryLogs.findOne({ userId },{ _id:0, createdAt:0, updatedAt:0 });

    if(!result){
      res.status(200).json({
        data:result,
        message: "No data found!!"
      });
    } else {
      res.status(200).json({
        success: true,
        data: result
      });
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post('/addHistoryLogs', (req, res) => {

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = {
    userId : req.body.userId,
    login : req.body.login,
    ipAddress : req.body.ipAddress,
    duration : req.body.duration,
    lastSeen : req.body.lastSeen,
    status : req.body.status
  };

  User.HistoryLogs.findOneAndUpdate(resSettingFilter, resSettingData, options, (err, result) => {
    if (err) {
      res.status(200).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(200).json({
        success: true,
        message: "success"
      });
    }
  });
});

router.post('/addMapLocation', (req, res) => {

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = {
    userId : req.body.userId,
    address1 : req.body.address1,
    address2 : req.body.address2,
    landmark : req.body.landmark,
    nameTage : req.body.nameTage
  };

  User.mapLoaction.findOneAndUpdate(resSettingFilter, resSettingData, options, (err, result) => {
    if (err) {
      res.status(200).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(200).json({
        success: true,
        message: "success"
      });
    }
  });
});

router.get("/getMapLocation", (req, res) => {
  User.mapLoaction.find({},{createdAt:0,updatedAt:0}, (err, data) => {
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
router.post('/userLike', (req, res) => {

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const resSettingFilter = { userId : req.body.userId };
  const resSettingData = {
    userId : req.body.userId,
    like : req.body.like,
    
  };

  User.Auth.findOneAndUpdate(resSettingFilter, resSettingData, options, (err, result) => {
    if (err) {
      res.status(200).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(200).json({
        success: true,
        message: "success"
      });
    }
  });
});

router.post('/regSupporter', (req, res) => {

  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingFilter = {userId : req.body.userId };
  const resSettingData = { userId : req.body.userId, isSupporter : req.body.isSupporter };

  User.Privacy.findOneAndUpdate(resSettingFilter, resSettingData, options, (error, result) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.status(200).json({
        isSupporter: result.isSupporter,
        message: "success"
      });
    }
  });
});

router.post('/follow',(req,res)=>{
 
  User.Privacy.find({ userId:req.body.userId}, (err, data) => {
    if(err) throw err;
    else {
      if(data[0].isPrivateAccount != false){
        let model = new User.followersRequest(req.body);
        model.save((err, data) => {
          if (err || !data) {
              res.status(400).send(err);
          } else {
            let model = new User.following({
              userId:data.senderId,
              senderId:data.userId
            });
            model.save((err,data)=>{
              if (err || !data) {
                res.status(400).send(err);
            }else{
              res.status(200).json({
                data: data,
                message: "request sent",
            });
            }
            })
            
          }
      });
      }else{
        let model = new User.followers(req.body);
        model.save((err, data) => {
          if (err || !data) {
              res.status(400).send(err);
          } else {
            let model = new User.following({
              userId:data.senderId,
              senderId:data.userId
            });
            model.save((err,data)=>{
              if (err || !data) {
                res.status(400).send(err);
            }else{
              res.status(200).json({
                data: data,
                message: "request sent",
            });
            }
            })
            
          }
      });
      }
    }
      
    
});
})

router.get("/getfollowersRequest/:id", (req, res) => {
  const id = req.params.id;
  User.followersRequest.aggregate([
    { $match: { userId: ObjectId(id), } },
   
    {
      $lookup: {
          from: 'userProfilePics',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'userProfile'
      },
  },
    {
        $lookup: {
            from: 'users',
            localField: 'senderId',
            foreignField: '_id',
            as: 'users'
        },
    },
    {
      $project: {
        _id: "$_id",
        userId: "$userId" ,
        senderId: "$senderId" ,
        fname: "$users.fname" ,
        lname: "$users.lname" ,
        profilePics: "$userProfile.profilePics" ,
      }
    }
 
    
]).then(data => {
    res.status(200).json(data);
}).catch(err => {
    res.status(400).json(err);
});
});

router.post('/acceptfollowRequest',(req,res)=>{
    User.followersRequest.findOneAndDelete( req.body, (err, data1) => {
        if (err) {
          res.status(400).send(err.message);
        } else {
      let model = new User.followers(req.body);
          model.save((err, data) => {
            if (err || !data) {
                res.status(400).send(err);
            } else {
              let obj={
                userId:data.senderId,
                senderId:data.userId,
              }
              let model = new User.requestAccepted(obj);
              model.save((err, data) => {
                if (err || !data) {
                    res.status(400).send(err);
                } else {
                  let model = new User.following(obj);
                  model.save((err, data) => {
                    if (err || !data) {
                        res.status(400).send(err);
                    } else {
                      res.status(200).json({
                        data: data,
                        message: "request accepted",
                      })
                      
                    }
                });
                  
                }
            });
              
            }
        });
      }
  })
})

router.get("/getRequestAcceptNotification/:id", (req, res) => {
  const id = req.params.id;
  User.requestAccepted.aggregate([
    { $match: { userId: ObjectId(id), } },
   
    {
      $lookup: {
          from: 'userProfilePics',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'userProfile'
      },
  },
    {
        $lookup: {
            from: 'users',
            localField: 'senderId',
            foreignField: '_id',
            as: 'users'
        },
    },
    {
      $project: {
        _id: "$_id",
        userId: "$userId" ,
        senderId: "$senderId" ,
        fname: "$users.fname" ,
        lname: "$users.lname" ,
        profilePics: "$userProfile.profilePics" ,
      }
    }
 
    
]).then(data => {
    res.status(200).json(data);
}).catch(err => {
    res.status(400).json(err);
});
});

router.get("/getFollowing/:id", (req, res) => {
  const id = req.params.id;
  User.following.aggregate([
    { $match: { userId: ObjectId(id), } },
   
    {
      $lookup: {
          from: 'userProfilePics',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'userProfile'
      },
  },
    {
        $lookup: {
            from: 'users',
            localField: 'senderId',
            foreignField: '_id',
            as: 'users'
        },
    },
    {
      $project: {
        _id: "$_id",
        userId: "$userId" ,
        senderId: "$senderId" ,
        fname: "$users.fname" ,
        lname: "$users.lname" ,
        profilePics: "$userProfile.profilePics" ,
      }
    },
    
]).then(data => {
      res.status(200).json(data);
  }).catch(err => {
      res.status(400).json(err);
  });
});

router.get("/getFollowers/:id", (req, res) => {
  const id = req.params.id;
  User.followers.aggregate([
    { $match: { userId: ObjectId(id), } },
   
    {
      $lookup: {
          from: 'userProfilePics',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'userProfile'
      },
  },
    {
        $lookup: {
            from: 'users',
            localField: 'senderId',
            foreignField: '_id',
            as: 'users'
        },
    },
    {
      $project: {
        _id: "$_id",
        userId: "$userId" ,
        senderId: "$senderId" ,
        fname: "$users.fname" ,
        lname: "$users.lname" ,
        profilePics: "$userProfile.profilePics" ,
      }
    }
 
    
]).then(data => {
    res.status(200).json(data);
}).catch(err => {
    res.status(400).json(err);
});
});

router.post("/unfollow",(req, res) => {
  const obj={
    userId:req.body.userId,
    senderId:req.body.senderId
  }
  User.following.findOneAndDelete( obj, (err, data1) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      const obj2={
        userId:req.body.senderId,
        senderId:req.body.userId
      }
      User.followers.findOne(obj2, (err, data) => {
        if (err) {
          res.status(400).send(err.message);
        }
        else{
          if(data==null){
            res.status(200).json({
              success: true,
              message: "Successfully",
          });
          }else{
            User.followers.findOneAndDelete(obj2, (err, data) => {
              if (err) {
                res.status(400).send(err.message);
              }else{
                res.status(200).json({
                  success: true,
                  message: "Successfully",
              });
              }
            });
          }
          
         
        }
      });
       
    }
  });
});

router.post("/InviteTeamMembers", async (req, res) => {
  let model = new User.InviteUsers(req.body);
  model.save((err, user) => {
          if (err) {
              res.send(err.message);
          } else {
                  User.Auth.findOne({_id:user.userId},(err,data)=>{
                    if(err){
                      res.status(400).send(err.message);
                    }else{
                      let fullName='';
                      if(data.name == null){
                         fullName=[data.fname , data.lname];
                      }else{
                         fullName=data.name;
                      }
                      for( i = 0; i < user.teammeber.length; i++ ) {
                        const url = 'https://localhost:3000/user/teammemberRequest?id=' + user.id;
                        if (user.teammeber[i].email) {
                              let=emailid=user.teammeber[i].email;
                           
                            email(emailid,"Invite Link","Invite Member", "teamMember",{fullName,emailid,url});
                      
                            } else {
                              const resetUrlTemplate= "<a href='"+ url +"'>Confirm</a>"
                              userPhone = `+91${user.teammeber[i].phone}`;
                              client.messages
                                .create({
                                  body: `accept the request ${resetUrlTemplate}`,
                                  messagingServiceSid: process.env.MSGSSID,
                                  to: userPhone,
                                })
                                .then((messages) => console.log(messages))
                                .catch((err) => console.error(err));
                            
                            }
                        User.Auth.findOne({$or:[{email:user.teammeber[i].email}, {phone:user.teammeber[i].phone}]},(err,result)=>{
                          if(err){res.status(400).send(err.message);}
                          else{
                            const obj={
                              userId:result.id,
                              senderId:req.body.userId,
                              notificationType:req.body.notificationType
                            }
                            let model = new User.AllNotifications(obj);
                            model.save((err,user2)=>{
                              if (err) {
                                res.send(err.message);
                              }else {}
                               
                            });
                          }
                           
                        });
                      }
                      res.status(200).send({
                        success: true,
                        message:
                          " Notification  is sent to users mobile number",
                      });
                    }
                  })
           
                }
   });
});

router.post("/Invitation", async (req, res) => {
  let model = new User.InviteUsers(req.body);
  model.save((err, user) => {
          if (err) {
              res.send(err.message);
          } else {
                  User.Auth.findOne({_id:user.userId},(err,data)=>{
                    if(err){
                      res.status(400).send(err.message);
                    }else{
                      let fullName='';
                      if(data.name == null){
                         fullName=[data.fname,data.lname];
                      }else{
                         fullName=data.name;
                      }
                        const url = 'https://localhost:3000/user/teammemberRequest?id=' + user.id;
                        if (user.teammeber.email) {
                              let=emailid=user.teammeber[0].email;
                           
                            email(emailid,"Invite Link","Invite Member", "teamMember",{fullName,emailid,url});
                      
                            } else {
                              const resetUrlTemplate= "<a href='"+ url +"'>Confirm</a>"
                              userPhone = `+91${user.teammeber[0].phone}`;
                              client.messages
                                .create({
                                  body: `accept the request ${resetUrlTemplate}`,
                                  messagingServiceSid: process.env.MSGSSID,
                                  to: userPhone,
                                })
                                .then((messages) => console.log(messages))
                                .catch((err) => console.error(err));
                            
                            }
                      res.status(200).send({
                        success: true,
                        message:
                          " Invitation  is sent to users",
                      });
                    }
                  })
           
                }
   });
});

router.post("/searchUser", (req, res) => {
  User.Auth.aggregate([
    { $match: { $or: [{"email": req.body.email}, {"phone": req.body.phone}] } },
    {
      $lookup: {
          from: 'userProfilePics',
          localField: '_id',
          foreignField: 'userId',
          as: 'userProfile'
      },
  },
   
    {
      $project: {
        _id: "$_id",
        fname: "$users.fname" ,
        lname: "$users.lname" ,
        profilePics: "$userProfile.profilePics" ,
      }
    }
 
    
]).then(data => {
    res.status(200).json(data);
}).catch(err => {
    res.status(400).json(err);
});
});

router.post("/AcceptTeamRequset", async (req, res) => {
  const options = { upsert : true, new : true, setDefaultsOnInsert : true };
  const resSettingData = { isRequest:true };
  User.AllNotifications.findOneAndUpdate(req.body, resSettingData, options, (error, result) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      const obj={
        userId:result.senderId,
        teamMemberId:result.userId
      }
      let model = new User.TeamMember(obj);
        model.save((err, user) => {
                if (err) {
                    res.send(err.message);
                } else { 
                      res.status(200).json({
                      isSupporter: result.isSupporter,
                      message: "success"
                    })
                  }
        });
    }
  });
});
  



module.exports = router;
