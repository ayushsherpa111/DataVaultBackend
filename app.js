if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
//Dependencies
const express = require("express");
const app = express();
const logger = require("morgan");
const cors = require("cors");
//Database
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Connected to the db");
  });

//Routes
const loginRoute = require("./routes/login");
app.use(
  cors({
    origin: "*"
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.use("/login", loginRoute);

module.exports = app;
