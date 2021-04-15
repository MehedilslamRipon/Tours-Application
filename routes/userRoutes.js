// dependencies
const express = require("express");
const {
   signup,
   login,
   resetPassword,
   forgotPassword,
} = require("./../controllers/authController");

const {
   getAllUsers,
   getUser,
   createUser,
   updateUser,
   deleteUser,
} = require("./../controllers/userController");

const router = express.Router();

// signup
router.post("/signup", signup);

// login
router.post("/login", login);

// forgot password
router.post("/forgotPassword", forgotPassword);

// reset password
router.patch("/resetPassword/:token", resetPassword);

// user routes
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
