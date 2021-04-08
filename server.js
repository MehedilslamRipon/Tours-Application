// dependencies
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

process.on("uncaughtException", (err) => {
   console.log(`UNCOUGHT EXCEPTION! 😪 Shutting down...`);
   console.log(err.name, err.message);
   process.exit(1);
});

const app = require("./app");

// connect mongoose to the app
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

// start the server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
   console.log(`🎉 Server is running on PORT: ${PORT}`);
});

process.on("unhandledRejection", (err) => {
   console.log(`UNHANDLER REJECTION! 😪 Shutting down...`);
   console.log(err.name, err.message);

   server.close(() => {
      process.exit(1);
   });
});
