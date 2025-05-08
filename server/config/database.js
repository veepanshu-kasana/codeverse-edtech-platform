const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        retryWrites: true,
    })
    .then(() => console.log("DB Connected Successfully"))
    .catch((error) => {
        console.log("DB Connection Failed");
        console.error("Error details:", error);
        process.exit(1);
    });
};