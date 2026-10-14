import express from "express";
import {
  verifyProductOwner,
  verifyToken,
} from "../../middlewares/verifyToken.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "./product.controller.js";
import upload from "../../middlewares/multer.js";
import reviewRoutes from "./Review/review.routes.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllProducts)
  .post(verifyToken, upload.array("productImages", 5), createProduct);

router
  .route("/:productId")
  .get(getProductById)
  .put(verifyProductOwner, upload.array("productImages", 5), updateProduct)
  .delete(verifyProductOwner, deleteProduct);

router.use("/:productId/reviews", reviewRoutes);

export default router;
