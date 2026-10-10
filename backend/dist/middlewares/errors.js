import { Error } from "mongoose";
const notFound = (req, res, next) => {
    const error = new Error(`Not found ${req.originalUrl}`);
    res.status(404);
    next(error);
};
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    return res.status(statusCode).json({ message: err.message });
};
const sendError = (res, statusCode, errorMessage) => {
    return res.status(statusCode).json({
        success: false,
        message: "Request failed",
        data: { message: errorMessage },
    });
};
const successMsg = (res, statusCode, successMessage, data) => {
    return res
        .status(statusCode)
        .json({ success: true, message: successMessage, data });
};
export { notFound, errorHandler, sendError, successMsg };
//# sourceMappingURL=errors.js.map