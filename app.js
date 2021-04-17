// dependencies
const morgan = require("morgan");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// global middleware
// set security HTTP headers (helmet)
app.use(helmet());

// development logging
if (process.env.NODE_ENV === "development") {
   app.use(morgan("dev"));
}

// protect from brut force attack
const limiter = rateLimit({
   max: 100,
   windowMs: 60 * 60 * 1000,
   message: "Too many request from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
   hpp({
      whitelist: [
         "duration",
         "ratingsQuantity",
         "ratingsAverage",
         "maxGroupSize",
         "difficulty",
         "price",
      ],
   })
);

// serving static files
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
