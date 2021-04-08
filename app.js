// dependencies
const morgan = require("morgan");
const express = require("express");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// middleware
if (process.env.NODE_ENV === "development") {
   app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// tour router
app.use("/api/v1/tours", tourRouter);

// user router
app.use("/api/v1/users", userRouter);

// handled route
app.all("*", (req, res, next) => {
   // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
   // (err.status = "fail"), (err.statusCode = 404);
   // next(err);

   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
