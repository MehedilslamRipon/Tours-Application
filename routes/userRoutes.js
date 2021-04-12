// dependencies
const express = require("express");
const { signup, login } = require("./../controllers/authController");

const {
   getAllUsers,
   getUser,
   createUser,
   updateUser,
   deleteUser,
} = require("./../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// user routes
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
