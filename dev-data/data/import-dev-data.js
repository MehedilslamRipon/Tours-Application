const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Tour = require("./../../models/tourModel");

const DB = process.env.DATABASE.replace(
   "<PASSWORD>",
   process.env.DATABASE_PASSWORD
);

mongoose
   .connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
   })
   .then(() => console.log(`🎇 Database Connection Successful!`));

// read JSON file
const tours = JSON.parse(
   fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8")
);

// import data into DB
const importData = async () => {
   try {
      await Tour.create(tours);
      console.log(`Data successfully loaded!`);
   } catch (err) {
      console.log(err);
   }
   process.exit();
};

// delete all data from DB
const deleteData = async () => {
   try {
      await Tour.deleteMany();
      console.log(`Data successfully deleted!`);
   } catch (err) {
      console.log(err);
   }
   process.exit();
};

if (process.argv[2] === "--import") {
   importData();
} else if (process.argv[2] === "--delete") {
   deleteData();
}

// command for import data
// node dev-data/data/import-dev-data.js --import

// command for delete data
// node dev-data/data/import-dev-data.js --delete
