const nodemailer = require("nodemailer");
const { createToken } = require("../middlewares/validation");
const { pbkdf2, createCipheriv, createDecipheriv } = require("crypto");
const jwt = require("jsonwebtoken");

async function sendConfirmation(email) {
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
  let html = await generateMessageBody(email)
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"DataVaultTeam" <datavault@noreply.com>', // sender address
    to: email, // list of receivers
    subject: "Signup Confirmation", // Subject line
    html // html body
  });

  return info;
}

async function generateMessageBody(userEmail) {
  try {
    let token = await createToken(
      { email: userEmail, _id:u },
      process.env.JWT_SECRET,
      {
        issuer: process.env.EMAIL,
        expiresIn: "1d"
      }
    );
    let activationLink =
      `${process.env.HOST}/signup/activate/`+ token;
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
  pbkdf2(pass, salt, 50000, 32, "whirlpool", cb);
}

function _encrypt(payload, algo, key, iv) {
  let cipher = createCipheriv(algo, key, iv);
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function _decrypt(payload, algo, key, iv) {
  let decipher = createDecipheriv(algo, key, iv);
  let dcrypted = decipher.update(payload, "hex", "utf8");
  dcrypted += decipher.final("utf8");
  return dcrypted;
}

function validateToken(token,secret,options){
  return jwt.verify(token,secret,options,(err,dec)=>{
    if(!err){
      return dec
    }
  })
}


module.exports = {
  sendConfirmation,
  generateMessageBody,
  hashUserPass,
  _encrypt,
  _decrypt,
  validateToken
};
