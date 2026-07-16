import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res
        .status(err.statusCode)
        .json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data,
        });
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export { errorHandler };
