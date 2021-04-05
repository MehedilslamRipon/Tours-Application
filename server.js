// dependencies
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
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
app.listen(PORT, () => {
   console.log(`🎉 Server is running on PORT: ${PORT}`);
});
