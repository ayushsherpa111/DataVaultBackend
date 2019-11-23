const router = require("express").Router();
const User = require("../models/Users");
const nodemailer = require("nodemailer");
const uuid = require("uuid/v1");
const { emailValidation } = require("../middlewares/validation");

router.post("/signup", emailValidation, (request, response) => {
  let email = request.body.email;
  let masterPassword = request.body.masterPassword;
  console.log({ email, masterPassword });
  let messagebody = generateMessageBody(email);
  sendConfirmation(email, messagebody)
    .then(info => {
      response.send("Please check your email to finish the setup");
    })
    .catch(e => {
      console.log("ERROR", e);
    });
});

router.post("/signup", (req, res) => {
  res.send("ERROR");
});

async function sendConfirmation(email, body) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"DataVaultTeam" <datavault@noreply.com>', // sender address
    to: email, // list of receivers
    subject: "Confirmation", // Subject line
    html: body // html body
  });

  return info;
}

function generateMessageBody(userEmail) {
  let activationLink = "/activate/" + userEmail + "/" + uuid() + "/confirm";

  let body = `
    <h2>Welcome!</h2><br>
    <p>Thank you ${userEmail}, for signing up for our data-vault service. Click the link below to activate your account</p>
    <a href="${activationLink}">Activate now</a>
    `;
  return body;
}

module.exports = router;
