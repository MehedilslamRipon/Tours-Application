// dependencies
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
   const newObj = {};

   Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
   });

   return newObj;
};

// users route handlers
exports.getAllUsers = factory.getAll(User);

/* catchAsync(async (req, res, next) => {
   const users = await User.find();

   // send response
   res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
   });
}); */

exports.getMe = (req, res, next) => {
   req.params.id = req.user.id;
   next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
   // create error if user posts password data
   if (req.body.password || req.body.passwordConfirm) {
      return next(
         new AppError(
            "This route is not for password updates, Please use /updatePassword.",
            400
         )
      );
   }

   // filtered out unwanted fields name that are not allowed to be updated
   const filteredBody = filterObj(req.body, "name", "email");

   // update user document
   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
   });

   res.status(200).json({
      status: "success",
      data: {
         user: updatedUser,
      },
   });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
   await User.findByIdAndUpdate(req.user.id, { active: false });

   res.status(204).json({
      status: "success",
      data: null,
   });
});

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
   res.status(500).json({
      status: "error",
      message: "This route is not yet defined! Please use /signup instead",
   });
};

// do not update password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
