// dependencies
const express = require("express");
const {
   getAllTours,
   getSingleTour,
   createTour,
   updateTour,
   deleteTour,
   checkId,
} = require("./../controllers/tourController");

const router = express.Router();

// middleware
router.param("id", checkId);

// routers
router.route("/").get(getAllTours).post(createTour);

router.route("/:id").get(getSingleTour).patch(updateTour).delete(deleteTour);

module.exports = router;
