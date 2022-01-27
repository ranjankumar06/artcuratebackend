const nodemailer = require("nodemailer");

const config = require("../helper/config");
const path = require("path");

const hbs = require("nodemailer-express-handlebars");

// email(userId, password, to, subject, template, text)

const email = (to, subject, text, templates, context) => {

  return new Promise((resolve, reject) => {
    
    const transporter = nodemailer.createTransport({
      host: config.emailHost,
      port: 465,
      secure: true, // true for 465, false for other ports
      // service: 'gmail',
      auth: {
        user: config.emailID,
        pass: config.emailPassword,
      },
    });

    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          partialsDir: "./views",
          defaultLayout: "",
        },
        viewPath: "./views/",
        extName: ".hbs",
      })
    );

    const mailOptions = {
      from: config.emailID,
      to: to,
      subject: subject,
      text: text,
      template: templates,
      context: context,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

module.exports = email;
