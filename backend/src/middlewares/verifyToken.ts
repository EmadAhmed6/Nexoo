import { Request, Response, NextFunction } from "express";
import { sendError } from "./errors.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Product } from "../modules/Product/product.model.js";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers.authorization;
  if (!token) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  token = token.split(" ")[1];
  if (!token) {
    sendError(res, 401, "No token provided");
    return;
  }

  const secret = process.env.JWT_SECRET_KEY!;
  try {
    const decode = jwt.verify(token, secret) as JwtPayload;
    req.user = decode;
    next();
  } catch (err) {
    sendError(res, 403, "Invalid or expired token");
    return;
  }
};

const verifyAuthorizedToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  verifyToken(req, res, () => {
    const userId = req.params.userId;
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }
    if (
      req.user?.id === userId ||
      req.user?.role === "Admin" ||
      req.user?.role === "SuperAdmin"
    ) {
      next();
    } else {
      sendError(res, 403, "Not Authorized");
      return;
    }
  });
};
const verifyAdminToken = (req: Request, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }
    if (req.user?.role === "Admin" || req.user?.role === "SuperAdmin") {
      next();
    } else {
      sendError(res, 403, "Not Authorized");
      return;
    }
  });
};

const verifyProductOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  verifyToken(req, res, async () => {
    const productId = req.params.productId;
    const userId = req.user?.id;
    const product = await Product.findById(productId);
    if (!product) {
      sendError(res, 404, "No Product found with this id");
      return;
    }
    if (
      product.userId?.toString() === userId ||
      req.user?.role === "Admin" ||
      req.user?.role === "SuperAdmin"
    ) {
      next();
    } else {
      sendError(res, 403, "Not Authorized");
      return;
    }
  });
};

export {
  verifyToken,
  verifyAuthorizedToken,
  verifyAdminToken,
  verifyProductOwner,
};
