// dependencies
const crypto = require("crypto");

const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

// const bcrypt = require('bcryptjs');

// generate token
const signToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });
};

const createSendToken = (user, statusCode, res) => {
   const token = signToken(user._id);

   const cookieOptions = {
      expires: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      // secure: true,
      httpOnly: true,
   };

   if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

   res.cookie("jwt", token, cookieOptions);

   res.status(statusCode).json({
      status: "success",
      token,
      data: {
         user,
      },
   });
};

exports.signup = catchAsync(async (req, res) => {
   // const newUser = await User.create(req.body);

   const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
   });

   createSendToken(newUser, 201, res);

   /* const token = signToken(newUser._id);

   res.status(201).json({
      status: "success",
      token,
      data: {
         user: newUser,
      },
   }); */
});

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   // check if email and password exist
   if (!email || !password) {
      return next(new AppError("Please Provide email and password", 400));
   }

   // check if user exist && password is correct
   const user = await User.findOne({ email }).select("+password");
   // const correct = await user.correctPassword(password, user.password);

   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
   }

   // if everything ok, send token to client
   createSendToken(user, 200, res);

   /* const token = signToken(user._id);

   // send response
   res.status(200).json({
      status: "success",
      token,
   }); */
});

exports.protect = catchAsync(async (req, res, next) => {
   // getting token and check of it's there
   let token;
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
   ) {
      token = req.headers.authorization.split(" ")[1];
      // [, token] = req.headers.authorization.split(" ");
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

exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return next(
            new appError(
               "you do not have permission to perform this action!",
               403
            )
         );
      }

      next();
   };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
   // get user based on POSTed email
   const user = await User.findOne({ email: req.body.email });

   if (!user) {
      return next(
         new appError("There is no user with this email address!", 404)
      );
   }

   // generate the random reset token
   const resetToken = user.createPasswordResetToken();
   await user.save({ validateBeforeSave: false });

   // send it to user's email
   const resetURL = `${req.protocol}://${req.get(
      "host"
   )}/api/v1/users/resetPassword/${resetToken}}`;

   const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

   try {
      await sendEmail({
         email: user.email,
         subject: "Your password reset token (valid for 10 minutes)",
         message,
      });

      res.status(200).json({
         status: "success",
         message: "Token sent to email",
      });
   } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return next(
         new AppError(
            "There was an error sending the email. Try again later!",
            500
         )
      );
   }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
   // get user based on the token
   const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

   const user = await User.findOne({
      PasswordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   });

   // if token has not expired, and there is user, set the new password
   if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
   }
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();

   // update changePasswordAt property for the user
   createSendToken(user, 200, res);

   /* const token = signToken(user._id);

   res.status(200).json({
      status: "success",
      token,
   }); */

   // log the user in, send JET
});

exports.updatePassword = catchAsync(async (req, res, next) => {
   // get user from the collection
   const user = await User.findById(req.user.id).select("+password");

   // check if POSTed current password is correct
   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError("Your current password is wrong.", 401));
   }

   // IF so, update password
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   await user.save();

   // Log user in, send JWT
   createSendToken(user, 200, res);
});
