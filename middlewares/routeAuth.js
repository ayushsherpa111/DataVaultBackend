const jwt = require("jsonwebtoken");
const createError = require("http-errors");

let restrictedAccess = async (req, _, next) => {
  let sentToken = req.get("X-ACCESS-TOKEN");
  if (sentToken != undefined || sentToken != null) {
    let token = sentToken.split(" ")[1];
    try {
      const payload = await jwt.verify(token, process.env.JWT_SECRET);
      if (payload) {
        req.payload = payload;
        next();
      } else {
        next(createError(400, "INVALID TOKEN"));
      }
    } catch {
      next(createError(418, "Something went wrong with the token"));
    }
  } else {
    next(createError(403, "Token Unavailable"));
  }
};

module.exports = {
  restrictedAccess
};
