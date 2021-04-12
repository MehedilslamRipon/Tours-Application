// dependencies
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
// const bcrypt = require('bcryptjs');

// generate token
const signToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });
};

exports.signup = catchAsync(async (req, res) => {
   // const newUser = await User.create(req.body);

   const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
   });

   const token = signToken(newUser._id);

   res.status(201).json({
      status: "success",
      token,
      data: {
         user: newUser,
      },
   });
});

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   // check if email and password exist
   if (!email || !password) {
      return next(new AppError("Please Provide email and password", 400));
   }

   // check if user exist && password is correct
   const user = await User.findOne({ email: email }).select("+password");
   // const correct = await user.correctPassword(password, user.password);

   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
   }

   // if everything ok, send token to client
   const token = signToken(user._id);

   // send response
   res.status(200).json({
      status: "success",
      token,
   });
});

exports.protect = catchAsync(async (req, res, next) => {
   // getting token and check of it's there
   let token;
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
   ) {
      token = req.headers.authorization.split(" ")[1];
   }

   if (!token) {
      return next(
         new AppError("Yor are not logged in! Please login to get access.", 401)
      );
   }

   // verification token
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

   // check if user still exist
   const currentUser = await User.findById(decoded.id);
   if (!currentUser) {
      return next(
         new AppError(
            "The user belonging to this token that does no longer exist!",
            401
         )
      );
   }

   // check if user changed password after the token was issued
   if (currentUser.changedPasswordAfter(decoded.id)) {
      return next(
         new AppError(
            "User recently changed password! Please log in again.",
            401
         )
      );
   }

   // grant access to protected route
   req.user = currentUser;
   next();
});
