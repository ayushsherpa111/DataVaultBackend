const User = require("../models/Users");
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
let emailValidation = async (req, res, next) => {
  const emailRegex = /^[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/gm;
  if (emailRegex.test(req.body.email)) {
    let found = await User.findOne({
      email: req.body.email
    });
    if (found == null) {
      next();
    } else {
      next(createError(400, "Email already Exists"));
    }
  } else {
    next(createError(403, `Invalid Email Dumbo ${req.body.email}`));
  }
};

let loginValidation = async (req, res, next) => {
  let foundUser = await User.findOne({ email: req.body.email });
  if (foundUser == null) {
    next(createError(404, "Authentication Error"));
  } else if (!foundUser.confirmed) {
    next(createError(401, "Confirm Email first"));
  } else {
    let passwordMatch = await bcrypt.compare(
      req.body.masterPassword,
      foundUser.masterPassword
    );
    if (passwordMatch) {
      let copyUser = foundUser.toJSON();
      copyUser.accessToken = await createToken(
        { userID: foundUser._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m"
        }
      );
      req.user = copyUser;
    } else {
      // req.user = null;
      next(createError(404, "Auth Error"));
    }
    next();
  }
};

async function createToken(payload, secret, options) {
  let accessToken = await jwt.sign(payload, secret, options);
  return accessToken;
}

module.exports = {
  emailValidation,
  loginValidation,
  createToken
};
