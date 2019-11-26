const User = require("../models/Users");
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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
    try {
      let passwordMatch = await pbkCompare(
        req.body.masterPassword,
        foundUser.masterPassword
      );
      console.log(passwordMatch);
      let copyUser = foundUser.toJSON();
      copyUser.accessToken = await createToken(
        { userID: foundUser._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m"
        }
      );
      req.user = copyUser;
      next();
    } catch {
      next(createError(404, "Auth Error"));
    }
  }
};

async function createToken(payload, secret, options) {
  let accessToken = await jwt.sign(payload, secret, options);
  return accessToken;
}

let authPassword = async (req, _, next) => {
  try {
    let hash = await crypto.pbkdf2Sync(
      req.body.masterPassword,
      process.env.SALT,
      95000,
      256,
      "whirlpool"
    );
    req.body.masterPassword = hash.toString("hex");
  } catch (error) {
    console.log(error);
    next(createError(500, "Unexpected Error"));
  }
  next();
};

function pbkCompare(plainText, hash) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      plainText,
      process.env.SALT,
      95000,
      256,
      "whirlpool",
      (err, derievedKey) => {
        if (hash === derievedKey.toString("hex")) {
          resolve(true);
        } else {
          reject(false);
        }
      }
    );
  });
}

module.exports = {
  emailValidation,
  loginValidation,
  createToken,
  authPassword
};
