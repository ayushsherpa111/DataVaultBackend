const User = require("../models/Users");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { pbkdf2Sync } = require("crypto");
const { Worker } = require("worker_threads");

let emailValidation = async (req, res, next) => {
  const emailRegex = /^[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/gm;
  if (emailRegex.test(req.body.email)) {
    let found = await User.findOne({
      email: req.body.email,
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

let loginValidation = async (req, _, next) => {
  // match: req.user.masterPassword
  if (req.user) {
    let passMatchW = new Worker("./helpers/hashGen.js", {
      workerData: {
        pass: req.body.masterPassword,
        salt: req.user.salt,
      },
    });
    passMatchW.addListener("message", (match) => {
      if (
        Buffer.from(match).toString("hex") ===
        req.user.masterPassword.toString("hex")
      ) {
        next();
      } else {
        next(createError(403, "Authentication failed. Please try again"));
      }
    });
  } else {
    next(createError(400, { message: "Invalid User" }));
  }
};

function TokenGenerator(secretOrPublic, secretOrPrivate, options) {
  this.secretOrPrivate = secretOrPrivate;
  this.secretOrPublic = secretOrPublic;
  this.options = options;
}
TokenGenerator.prototype.sign = function (payload, signOptions) {
  const jwtOptions = Object.assign({}, signOptions, this.options);
  return jwt.sign(payload, this.secretOrPrivate, jwtOptions);
};

TokenGenerator.prototype.verify = function (token, signOptions) {
  const jwtVerifyOptions = Object.assign({}, signOptions, this.options);
  console.log(jwt.verify(token, this.secretOrPublic));
  return jwt.verify(token, this.secretOrPublic, jwtVerifyOptions);
};

TokenGenerator.prototype.refresh = function (expToken, signOptions) {
  const payload = jwt.verify(expToken, this.secretOrPublic, signOptions.verify);
  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti;
  const jwtOpts = Object.assign({}, this.options, { jwtid: signOptions.jwtid });
  return this.sign(payload, jwtOpts);
};

TokenGenerator.prototype.decode = function (token) {
  return jwt.decode(token);
};

async function createToken(payload, secret, options) {
  let accessToken = await jwt.sign(payload, secret, options);
  return accessToken;
}

let authPassword = async (req, _, next) => {
  crypto.pbkdf2(
    req.body.masterPassword,
    process.env.SALT || "h",
    95000,
    256,
    "whirlpool",
    (err, key) => {
      if (!err) {
        req.body.masterPassword = key.toString("hex");
        next();
      } else {
        next(createError("Error in validationJS"));
      }
    }
  );
};

function hashUserPass(pass, salt) {
  return new Promise((res, _) => {
    res(pbkdf2Sync(pass, salt, 50000, 32, "whirlpool"));
  });
}

module.exports = {
  emailValidation,
  loginValidation,
  createToken,
  authPassword,
  TokenGenerator,
};
