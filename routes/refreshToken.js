const router = require("express").Router();
const User = require("../models/Users");
const { accessTokenGen, refreshTokenGen } = require("../helpers/tokenConsts");

router.post("/", async (req, res) => {
  try {
    const refreshToken = req.body.refresh;
    let refPayload = refreshTokenGen.verify(refreshToken, {
      issuer: "data vault",
    });
    let foundUser = await User.findById(refPayload._id, {
      refCount: 1,
      email: 1,
    });
    if (
      foundUser &&
      foundUser.refCount === refPayload.refCount &&
      foundUser._id == refPayload._id
    ) {
      console.log("GETTING NEW ACCESS TOKEN");
      let newAccessToken = accessTokenGen.sign(
        {
          _id: refPayload._id,
          email: foundUser.email,
        },
        {
          issuer: "data vault",
        }
      );
      res.set({ "X-ACCESS-TOKEN": "Bearer " + newAccessToken });
      return res.status(200).send({ msg: "Regenerated" });
    } else {
      return next(createError("IDK"));
    }
  } catch (error) {
    console.log(error);
    // referesh token has either expired or is invalid
    return next(createError(401, "Access Token Failed"));
  }
});

module.exports = router;
