const nodemailer = require("nodemailer");
const { createToken } = require("../middlewares/validation");
const { pbkdf2 } = require("crypto");
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
      "http://127.0.0.1:8001/signup/activate/" +
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

function hashUserPass(pass, salt, cb) {
  pbkdf2(pass, salt, 50000, 256, "whirlpool", cb);
}

module.exports = {
  sendConfirmation,
  generateMessageBody,
  hashUserPass
};
