const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const createError = require('http-errors')
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {
  emailValidation,
  loginValidation,
  createToken,
  authPassword
} = require("../middlewares/validation");

router.post("/", loginValidation, async (req, res) => {
  res.cookie(
    "jid",
    await createToken(
      { _id: req.user._id, email: req.user.email },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    ),
    {
      httpOnly: true,
      expires: new Date(Date.now() + 800000000)
    }
  );
  res.json(req.user);
});

router.post("/signup", emailValidation, authPassword, async (request, response,next) => {
  let email = request.body.email;
  let masterPassword = request.body.masterPassword;
  let newUser = new User({
    email,
    masterPassword
  });
  generateMessageBody(email, response)
    .then(body => {
      sendConfirmation(email, body)
        .then(async info => {
          await newUser.save();
          response.send(
            "Please check your email to finish the setup" + info.messageId
          );
        })
        .catch(e => {
          console.log("ERROR", e);
          next(createError(400,"Email doesnot exist"))
        });
    })
    .catch(e => {
      console.log("ERROR: ", e);
      next(createError(418,"OOPS"))
    });
});

router.get("/activate/:email/:token/confirm", (request, response) => {
  let email = request.params.email;
  let token = request.params.token;
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    {
      issuer: process.env.EMAIL,
      expiresIn: "1d",
      subject: email
    },
    async (err, decoded) => {
      if (!err) {
        await User.findOneAndUpdate(
          { email },
          {
            confirmed: true
          }
        );
        response.redirect("../../../../upload");
      }
    }
  );
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

async function generateMessageBody(userEmail) {
  try {
    let token = await createToken(
      { email: userEmail },
      process.env.JWT_SECRET,
      {
        issuer: process.env.EMAIL,
        expiresIn: "1d",
        subject: userEmail
      }
    );
    let activationLink =
      "http://127.0.0.1:8001/login/activate/" +
      userEmail +
      "/" +
      token +
      "/confirm";
    let body = `
          <h2>Welcome!</h2><br>
          <p>Thank you ${userEmail}, for signing up for our data-vault service. Click the link below to activate your account</p>
          <a href="${activationLink}">Activate now</a>
          `;
    return body;
  } catch {
    console.log("Something went wrong");
  }
}

module.exports = router;
