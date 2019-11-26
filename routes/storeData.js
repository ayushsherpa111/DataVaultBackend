const router = require("express").Router();
const { restrictedAccess } = require("../middlewares/routeAuth");

router.get("/", restrictedAccess, (req,res) => {
    res.send("HI")
});

module.exports = router;
