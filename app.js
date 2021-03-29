// dependencies
const morgan = require("morgan");
const express = require("express");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// middleware
if (process.env.NODE_ENV === "development") {
   app.use(morgan("dev"));
}

app.use(express.json());

// tour router
app.use("/api/v1/tours", tourRouter);

// user router
app.use("/api/v1/users", userRouter);

module.exports = app;
