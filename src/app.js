import cors from "cors";
import express from "express";
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: '12kb' }));
app.use(express.urlencoded({ extended: true, limit: '12kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import treeRouter from "./routes/tree.routes.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users",userRouter);
app.use("/api/v1/tree", treeRouter);

import { errorHandler } from "../middlewares/error.middleware.js";
app.use(errorHandler);

export default app;