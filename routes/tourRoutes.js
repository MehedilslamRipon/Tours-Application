// dependencies
const express = require("express");
const {
   getAllTours,
   getSingleTour,
   createTour,
   updateTour,
   deleteTour,
   aliasTopTours,
} = require("./../controllers/tourController");

const router = express.Router();

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

// routers
router.route("/").get(getAllTours).post(createTour);

router.route("/:id").get(getSingleTour).patch(updateTour).delete(deleteTour);

module.exports = router;
