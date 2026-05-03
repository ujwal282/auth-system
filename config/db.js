const mongoose = require("mongoose");

const connectDB = async() => {
    try {

        const connection = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "authentication"
        });
        console.log("MongoDB connection Sucessfully");
        
    } catch (error) {
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
}

module.exports = connectDB;