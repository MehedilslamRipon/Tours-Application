// dependencies
const fs = require("fs");

const tours = JSON.parse(
   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// middleware
exports.checkId = (req, res, next, val) => {
   console.log(`Tour id is: ${val}`);

   if (req.params.id * 1 > tours.length) {
      return res.status(404).json({
         status: "failed",
         message: "Invalid ID",
      });
   }
   next();
};

// tour router handlers
exports.getAllTours = (req, res) => {
   res.status(200).json({
      status: "success",
      results: tours.length,
      tours: {
         tours,
      },
   });
};

exports.getSingleTour = (req, res) => {
   const id = req.params.id * 1;

   const tour = tours.find((el) => el.id === id);

   // if (!tour) {
   //    return res.status(404).json({
   //       status: "failed",
   //       message: "Invalid ID",
   //    });
   // }

   res.status(200).json({
      status: "success",
      tours: {
         tour,
      },
   });
};

exports.createTour = (req, res) => {
   const newId = tours[tours.length - 1].id + 1;
   const newTour = Object.assign({ id: newId }, req.body);

   tours.push(newTour);

   fs.writeFileSync(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
         res.status(201).json({
            status: "success",
            data: {
               tour: newTour,
            },
         });
      }
   );
};

exports.updateTour = (req, res) => {
   // if (req.params.id * 1 > tours.length) {
   //    return res.status(404).json({
   //       status: "failed",
   //       message: "Invalid ID",
   //    });
   // }

   res.status(201).json({
      status: "success",
      data: {
         tour: "<Updated data here...>",
      },
   });
};

exports.deleteTour = (req, res) => {
   res.status(204).json({
      status: "success",
      data: {
         tour: null,
      },
   });
};
