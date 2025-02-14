if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
//Dependencies
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
//Database
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to the db");
  });

mongoose.set("userCreateIndex", true);

//Routes
const loginRoute = require("./routes/login");
const signupRoute = require("./routes/signup");
const uploadRoute = require("./routes/storeData");
const refreshRoute = require("./routes/refreshToken");
//Middlewares
app.use(function (req, res, next) {
  res.removeHeader("X-Powered-By");
  next();
});
app.use(
  cors({
    origin: "*",
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use((req, res, next) => {
  res.set({
    "access-control-expose-headers": ["X-ACCESS-TOKEN", "X-REFRESH-TOKEN"],
  });
  next();
});
app.use(cookieParser(process.env.COOKIE_SECET));

// Routes
app.use("/signup", signupRoute);
app.use("/login", loginRoute);
app.use("/upload", uploadRoute);
app.use("/refresh", refreshRoute);

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    error: err.message,
  });
});

module.exports = app;
