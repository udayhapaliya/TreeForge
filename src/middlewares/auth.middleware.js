import { asyncHandler } from "../src/utils/asyncHandler.js";
import { ApiError } from "../src/utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../src/models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    console.log("Authorization:", req.header("Authorization"));
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken || !decodedToken.userId) {
            throw new ApiError(401, "Unauthorized request");
        }

        const user = await User.findById(decodedToken?.userId).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError(401, error.message || "Invalid Access Token");
    }
}) 