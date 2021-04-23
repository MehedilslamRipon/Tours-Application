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
   getTourWithin,
   getDistances,
} = require("./../controllers/tourController");
const { protect, restrictTo } = require("./../controllers/authController");
// const { createReview } = require("./../controllers/reviewController");
const reviewRouter = require("./../routes/reviewRoutes");

const router = express.Router();

router.use(":tourId/reviews", reviewRouter);

// routers
// top 5 cheap rated tours
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

// know tour stats
router.route("/tour-stats").get(getTourStats);

// get monthly plan of tours
router
   .route("/monthly-plan/:year")
   .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

router
   .route("/tours-within/:distance/center/:letlng/unit/:unit")
   .get(getTourWithin);

router.route("/distance/:latlng/unit/:unit").get(getDistances);

router
   .route("/")
   .get(getAllTours)
   .post(protect, restrictTo("admin", "lead-guide"), createTour);

router
   .route("/:id")
   .get(getSingleTour)
   .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
   .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

// router
//    .route("/:tourId/reviews")
//    .post(protect, restrictTo("user"), createReview);

module.exports = router;
