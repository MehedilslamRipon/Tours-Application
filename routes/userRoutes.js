// dependencies
const express = require("express");
const {
   signup,
   login,
   resetPassword,
   forgotPassword,
   updatePassword,
   protect,
} = require("./../controllers/authController");

const {
   getAllUsers,
   getUser,
   createUser,
   updateUser,
   deleteUser,
   updateMe,
   deleteMe,
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

// update password
router.patch("/updatePassword", protect, updatePassword);

// update me
router.patch("/updateMe", protect, updateMe);

// delete me
router.delete("/deleteMe", protect, deleteMe);

// user routes
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
