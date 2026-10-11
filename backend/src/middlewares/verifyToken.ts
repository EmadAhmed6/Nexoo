import { Request, Response, NextFunction } from "express";
import { sendError } from "./errors.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Product } from "../modules/Product/product.model.js";
import { Cart } from "../modules/Cart/cart.model.js";
import { Order } from "../modules/Order/order.model.js";

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
    const currentUserId = req.user?.id;
    if (!req.user || !currentUserId) {
      sendError(res, 401, "Unauthorized");
      return;
    }
    if (
      currentUserId.toString() === userId?.toString() ||
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
    try {
      const productId = req.params.productId;
      const userId = req.user?.id;
      const product = await Product.findById(productId);
      if (!product) {
        sendError(res, 404, "No Product found with this id");
        return;
      }
      if (
        !product.userId ||
        product.userId.toString() === userId?.toString() ||
        req.user?.role === "Admin" ||
        req.user?.role === "SuperAdmin"
      ) {
        next();
      } else {
        sendError(res, 403, "Not Authorized");
        return;
      }
    } catch (error) {
      sendError(res, 500, "Internal Server Error");
      return;
    }
  });
};

const verifyCartOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  verifyToken(req, res, async () => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        sendError(res, 401, "Unauthorized");
        return;
      }
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        sendError(res, 404, "No cart found with this userId");
        return;
      }
      if (
        cart.userId?.toString() === userId?.toString() ||
        req.user?.role === "Admin" ||
        req.user?.role === "SuperAdmin"
      ) {
        next();
      } else {
        sendError(res, 403, "Not Authorized");
        return;
      }
    } catch (error) {
      sendError(res, 500, "Internal Server Error");
      return;
    }
  });
};

const verifyOrderOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  verifyToken(req, res, async () => {
    try {
      const userId = req.user?.id;
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId);
      if (!order) {
        sendError(res, 404, "No order found with this id");
        return;
      }
      if (
        order.user.toString() === userId?.toString() ||
        req.user?.role === "Admin" ||
        req.user?.role === "SuperAdmin"
      ) {
        next();
      } else {
        sendError(res, 403, "Not Authorized");
        return;
      }
    } catch (err) {
      sendError(res, 500, "Internal Server Error");
      return;
    }
  });
};

export {
  verifyToken,
  verifyAuthorizedToken,
  verifyAdminToken,
  verifyProductOwner,
  verifyCartOwner,
  verifyOrderOwner,
};
