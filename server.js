const app = require("./app.js");
require("dotenv").config();
const connectDB = require("./config/db.js");
const PORT = process.env.PORT || 3000;

connectDB();

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV}  ${process.env.PORT}`)
});


process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});