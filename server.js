// dependencies
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");

// console.log(process.env);

// start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
   console.log(`Server is running on PORT: ${PORT}`);
});
