// dependencies
const express = require("express");
const {
   getAllTours,
   getSingleTour,
   createTour,
   updateTour,
   deleteTour,
   aliasTopTours,
   getTourStats,
   getMonthlyPlan,
} = require("./../controllers/tourController");
const { protect } = require("./../controllers/authController");

const router = express.Router();

// routers
// top 5 cheap rated tours
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

// know tour stats
router.route("/tour-stats").get(getTourStats);

// get monthly plan of tours
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/").get(protect, getAllTours).post(createTour);

router.route("/:id").get(getSingleTour).patch(updateTour).delete(deleteTour);

module.exports = router;
