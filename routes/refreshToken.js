const router = require("express").Router();
const { generateAccessToken } = require("../middlewares/routeAuth");
const { createToken } = require("../middlewares/validation");
const _ = require("lodash");
router.post("/", generateAccessToken, async (req, res) => {
  let user = _.omit(_.clone(req.user), ["iat", "exp"]);
  try {
    user.accessToken = await createToken(
      { userID: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m"
      }
    );
  } catch (e) {
    console.log(e);
  }
  res.send(user);
});

module.exports = router;
