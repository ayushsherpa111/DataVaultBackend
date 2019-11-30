const router = require("express").Router();
const { restrictedAccess } = require("../middlewares/routeAuth");
const User = require("../models/Users");
router.get("/", restrictedAccess, (req, res) => {
  res.send("HI");
});

router.post("/", restrictedAccess, async (req, res) => {
  let user = await User.findById(req.payload.userID);
  user.vault.push(req.body);
  user.save((err, doc) => {
    res.send(doc);
  });
});

module.exports = router;
