const router = require("express").Router();
const User = require("../models/Users");
const jwt = require("jsonwebtoken");

const {
  loginValidation,
  createToken,
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
  res.json(req.user)
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
        response.send({
          message: "Welcome"
        });
        // response.redirect("../../../../upload");
      }
    }
  );
});

module.exports = router;
