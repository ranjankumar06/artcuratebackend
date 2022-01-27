let jwt = require("jsonwebtoken");

const config = require('../helper/config');
const User = require('../modules/user/models');
const Admin = require('../modules/admin/models');
const Settings = require("../modules/userVerification/models");

let loginObj = {
  getUserInfo: (req, res, next) => {
    const id = req.params.id;
    const type = req.params.type;
    let obj = { fname: 1 };
    if (type == "email") {
      obj.email = 1;
    } else {
      obj.phone = 1;
    }

    User.Auth.findById(id, obj, (err, data) => {
      if (err) {
        res.send(err.message);
      } else {
        console.log(data);
        req.data = data;
        next();
      }
    });
  },

  getRegInfo: (req, res, next) => {
    const id = req.params.id;
    const type = req.params.type;
    let obj = { fname: 1 };
    if (type == "email") {
      obj.email = 1;
    } else {
      obj.phone = 1;
    }

    User.Register.findById(id, obj, (err, data) => {
      if (err) {
        res.send(err.message);
      } else {
        console.log(data);
        req.data = data;
        next();
      }
    });
  },

  generateSecurityCode: () => {
    return Math.floor(100000 + Math.random() * 900000);
  },

  emailSecurityCode: () => {
    return Math.floor(100000 + Math.random() * 900000);
  },

  phoneSecurityCode: () => {
    return Math.floor(100000 + Math.random() * 900000);
  },

  // Check Username for User is Exist or Not. & Also Check User Status.
  // Params Or Object : Username
  checkExistingUser: (req, res, next) => {
    let obj = req.body;
    let conObj;
    if ("email" in obj) {
      conObj = { email: obj.email };
    } else {
      conObj = { phone: obj.phone };
    }
    User.Auth.findOne(conObj, (err, data) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        if (data) {
          let message = "",
            msg = "";
          if (data.email == obj.email) {
            message = "Email/Phone is Already Exist.";
          }
          else if (data.phone == obj.phone) {
            msg = "Email/Phone is Already Exist.";
          }
          res.status(409).json({message, msg});
        } else {
          next();
        }
      }
    });
  },

  // checkExestingRegisteredUser

  // Check Username for User is Exist or Not. & Also Check User Status.
  // Params Or Object : Username
  checkExestingAdmin: (req, res, next) => {
    let obj = req.body;
    let conObj;
    if ("email" in obj) {
      conObj = { email: obj.email };
    } else {
      conObj = { phone: obj.phone };
    }
    Admin.Auth.findOne(conObj, (err, data) => {
      if (err) {
        res.send(err.message);
      } else {
        if (data) {
          let message = "",
            msg = "";
          if (data.email == obj.email) {
            message = "Email is Already Exist.";
          }
          if (data.phone == obj.phone) {
            msg = "Phone is Already Exist.";
          }
          res.send(message + " " + msg);
        } else {
          next();
        }
      }
    });
  },
  // Check Username for User is Exist or Not. & Also Check User Status.
  // Params Or Object : Username
  // checkExistingUsername: (req, res, next) => {
  //   User.Auth.findOne({ username: req.body.username }, (err, data) => {
  //     if (err) {
  //       res.send(err.message);
  //     } else {
  //       if (data) {
  //         let errorMsg = "";
  //         if (data.username == req.body.username) {
  //           errorMsg = "Username is already exist.";
  //         }
  //         res.send(errorMsg);
  //       } else {
  //         next();
  //       }
  //     }
  //   });
  // },
  validateUserName(username){
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username);
  },

  validatePassword(password){
    const pwd = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,30}$/;
    return pwd.test(password);
  },

  validatePhone(phone){
    const phoneno = /^\d{12}$/;
    return phoneno.test(phone);
  },

  validateEmail(email){
    const eml = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return eml.test(email);
  },

  checkExistingUsername: (req, res, next) => {
    User.Auth.findOne({ username: req.body.username }, (err, data) => {
      if (err) {
        res.send(err.message);
      } else {
        if (data) {
          let errorMsg = "";
          if (data.username == req.body.username) {
            //need to optimize code
            errorMsg = "Username is already exists.";
            n1 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
            n2 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
            n3 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
          }
          res.send({
            errorMsg,
            suggetions: { n1, n2, n3 },
          });
        } else {
          next();
        }
      }
    });
  },

  verifyToken: (req, res, next) => {
    const token = req.headers['Authorization'];

    // let token = req.cookies.accessToken;
    if (!token) {
      res.status(401).send({ auth: false, message: "No token provided." });
    } else {
      jwt.verify(token, config.secrateKey, (err, decoded) => {
        if (err) {
          res
            .status(500)
            .json({
              auth: false,
              message: "Failed to authenticate token.",
              error: err,
            });
        } else {
          next();
        }
      });
    }
  },

  checkExistingRegName: (req, res, next) => {
    User.Register.findOne({ username: req.body.username }, (err, data) => {
      if (err) {
        res.send(err.message);
      } else {
        if (data) {
          let errorMsg = "";
          if (data.username == req.body.username) {
            //need to optimize code
            errorMsg = "Username is already exists.";
            n1 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
            n2 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
            n3 = `${req.body.username}` + Math.floor(100 + Math.random() * 900);
          }
          res.send({
            errorMsg,
            suggetions: { n1, n2, n3 },
          });
        } else {
          next();
        }
      }
    });
  },

  checkExistingUserVerificationId: async (req, res, next) => {
    await Settings.Verification.findOne({ userId: req.body.userId }, (err, data) => {
      if(err) {
        throw err;
      } else {
        if(data) {
          return (
              res.status(409).json({
                success: false,
                message: "Verification Already Sent!"
              })
          );
        } else {
          console.log("NEXT");
          next();
        }
      }
    });
  }
};

module.exports = loginObj;