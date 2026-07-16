import connectDB from "./config/userDB.js";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server is running");
        });
    })
    .catch((err) => {
        console.log(err);
    });