const router = require("express").Router();
const User = require("../models/Users");
const { body, validationResult } = require("express-validator");
const { decode } = require("jsonwebtoken");
const { loginValidation } = require("../middlewares/validation");
const { refreshTokenGen, accessTokenGen } = require("../helpers/tokenConsts");
router.post(
  "/",
  [
    body("masterPassword").notEmpty(),
    body("email")
      .notEmpty()
      .normalizeEmail({
        all_lowercase: true
      })
      .escape()
      .custom(async (email, { req }) => {
        let foundUser = await User.findOne({ email });
        if (foundUser == null) {
          return Promise.reject("User not Found");
        } else {
          req.user = foundUser;
          return Promise.resolve();
        }
      }),
    loginValidation
  ],
  async (req, res) => {
    const err = validationResult(req);
    if (err.isEmpty()) {
      let refCount = req.user.refCount;
      let acsToken = accessTokenGen.sign(
        {
          _id: req.user._id,
          email: req.user.email
        },
        {
          issuer: "data vault"
        }
      );
      let refToken = refreshTokenGen.sign(
        {
          refCount: refCount,
          _id: req.user._id
        },
        { issuer: "data vault", audience: "standard user" }
      );
      res.set({
        "X-ACCESS-TOKEN": "Bearer " + acsToken,
        "X-REFRESH-TOKEN": refToken
      });
      res.json({ msg: "Logged in", body: req.body });
    } else {
      res.send({ msg: "FAILED", err });
    }
  }
);

router.post("/refDecode", (req, res) => {
  res.send(decode(req.get("X-REFRESH-TOKEN")));
});

module.exports = router;
