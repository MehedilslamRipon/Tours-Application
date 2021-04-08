// dependencies
// const fs = require("fs");
const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// middleware
exports.aliasTopTours = (req, res, next) => {
   req.query.limit = "5";
   req.query.sort = "-ratingsAverage,price";
   req.query.fields = "name,price,ratingsAverage,summary,difficulty";
   next();
};

// for local
/* const tours = JSON.parse(
   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

// tour router handlers
exports.getAllTours = catchAsync(async (req, res) => {
   // try {
   // console.log(req.query);
   // console.log(req.query.page);

   // build query
   // 1) basic filtering
   // const queryObj = { ...req.query };
   // const excludedFields = ["limit", "page", "sort", "fields"];
   // excludedFields.forEach((el) => delete queryObj[el]);

   // 2) advance filtering
   // let queryStr = JSON.stringify(queryObj);
   // queryStr = queryStr.replace(
   //    /\b(gte|gt|lte|lt)\b/g,
   //    (match) => `$${match}`
   // );

   // let query = Tour.find(JSON.parse(queryStr));

   // 3) sort by price
   // if (req.query.sort) {
   //    let sortBy = req.query.sort.split(",").join(" ");

   //    query = query.sort(sortBy);
   // } else {
   //    query.sort("-createdAt");
   // }

   // 4) field limiting
   // if (req.query.fields) {
   //    let fields = req.query.fields.split(",").join(" ");
   //    query.select(fields);
   // } else {
   //    query.select("-__v");
   // }

   // pagination
   // const page = req.query.page * 1 || 1;
   // const limit = req.query.limit * 1 || 100;
   // const skip = (page - 1) * limit;

   // query = query.skip(skip).limit(limit);

   // if (req.query.page) {
   //    const numTours = await Tour.countDocuments();
   //    if (skip >= numTours) throw new Error("This page does not exist!");
   // }

   // execute query
   const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

   const tours = await features.query;

   // send result
   res.status(200).json({
      status: "success",
      results: tours.length,
      tours: {
         tours,
      },
   });
   // } catch (err) {
   //    res.status(400).json({
   //       status: "fail",
   //       message: err,
   //    });
   // }
});

exports.getSingleTour = catchAsync(async (req, res, next) => {
   // try {
   // console.log(req.params);
   const tour = await Tour.findById(req.params.id);

   if (!tour) {
      return next(new AppError("No tour found with that ID", 404));
   }

   res.status(200).json({
      status: "success",
      tours: {
         tour,
      },
   });
   // } catch (err) {
   //    res.status(400).json({
   //       status: "fail",
   //       message: err,
   //    });
   // }
});

exports.createTour = catchAsync(async (req, res, next) => {
   const newTour = await Tour.create(req.body);

   res.status(201).json({
      status: "success",
      data: {
         tour: newTour,
      },
   });

   /* try {
      const newTour = await Tour.create(req.body);

      res.status(201).json({
         status: "success",
         data: {
            tour: newTour,
         },
      });
   } 
   
   catch (err) {
      res.status(400).json({
         status: "fail",
         message: err,
      });
   } */
});

exports.updateTour = catchAsync(async (req, res, next) => {
   // try {
   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

   if (!tour) {
      return next(new AppError("No tour found with that ID", 404));
   }

   res.status(201).json({
      status: "success",
      data: {
         tour,
      },
   });
   // } catch (err) {
   //    res.status(400).json({
   //       status: "fail",
   //       message: err,
   //    });
   // }
});

exports.deleteTour = catchAsync(async (req, res, next) => {
   // try {
   const tour = await Tour.findByIdAndDelete(req.params.id);

   if (!tour) {
      return next(new AppError("No tour found with that ID", 404));
   }

   res.status(204).json({
      status: "success",
      data: null,
   });
   // } catch (err) {
   //    res.status(400).json({
   //       status: "fail",
   //       message: err,
   //    });
   // }
});

exports.getTourStats = catchAsync(async (req, res, next) => {
   // try {
   const stats = await Tour.aggregate([
      {
         $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
         $group: {
            _id: { $toUpper: "$difficulty" },
            numTours: { $sum: 1 },
            numRatings: { $sum: "$ratingsQuantity" },
            avgRating: { $avg: "$ratingsAverage" },
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
         },
      },
      {
         $sort: { avgPrice: 1 },
      },
      // {
      //    $match: { _id: { $ne: "EASY" } },
      // },
   ]);

   // send result
   res.status(200).json({
      status: "success",
      data: {
         stats,
      },
   });
   // } catch (err) {
   //    res.status(400).json({
   //       status: "fail",
   //       message: err,
   //    });
   // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
   // try {
   const year = req.params.year * 1;
   const plan = await Tour.aggregate([
      {
         $unwind: "$startDates",
      },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`),
            },
         },
      },
      {
         $group: {
            _id: { $month: "$startDates" },
            numTourStats: { $sum: 1 },
            tours: { $push: "$name" },
         },
      },
      {
         $addFields: { month: "$_id" },
      },
      {
         $project: {
            _id: 0,
         },
      },
      {
         $sort: { numberTourStarts: -1 },
      },
      {
         $limit: 12,
      },
   ]);

   // send the result
   res.status(200).json({
      status: "success",
      // results: plan.length,
      data: {
         plan,
      },
   });
   // } catch (err) {
   //    res.status(400).json({
   //       status: "fail",
   //       message: err,
   //    });
   // }
});
