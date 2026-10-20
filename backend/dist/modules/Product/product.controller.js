import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../middlewares/errors.js";
import { Product, validateCreateProduct, validateUpdateProduct, } from "./product.model.js";
import cloudinary from "../../config/cloudinary.js";
// CREATE A NEW PRODUCT
const createProduct = asyncHandler(async (req, res) => {
    const { error, success } = validateCreateProduct(req.body);
    const { title, description, price, priceAfterDiscount, stock, category } = req.body;
    if (!success) {
        sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
        return;
    }
    const files = req.files;
    if (!files || files.length === 0) {
        sendError(res, 400, "No File Uploaded");
        return;
    }
    const uploadedFiles = files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "Products",
            resource_type: "auto",
        });
        return { url: result.secure_url, publicId: result.public_id };
    });
    const uploadedImages = await Promise.all(uploadedFiles);
    const newProduct = new Product({
        title,
        description,
        price,
        priceAfterDiscount: priceAfterDiscount || undefined,
        stock,
        category,
        productImages: uploadedImages,
        userId: req.user?.id,
    });
    const finalProduct = await newProduct.save();
    successMsg(res, 201, "Product created successfully", finalProduct);
});
// GET ALL PRODUCTS
const getAllProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const productPerPage = Number(req.query.limit) || 10;
    const { minPrice, maxPrice, category, search, inStock, minRating, maxRating, hasDiscount, } = req.query;
    const query = {};
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice)
            query.price.$gte = Number(minPrice);
        if (maxPrice)
            query.price.$lte = Number(maxPrice);
    }
    if (category && category !== "All") {
        query.category = category;
    }
    if (search) {
        const searchNum = Number(search);
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
        ];
        if (!isNaN(searchNum)) {
            query.$or.push({ price: searchNum }, { stock: searchNum });
        }
    }
    if (minRating || maxRating) {
        query.ratingAverage = {};
        if (minRating)
            query.ratingAverage.$gte = Number(minRating);
        if (maxRating)
            query.ratingAverage.$lte = Number(maxRating);
    }
    if (inStock !== undefined) {
        if (inStock === "true") {
            query.stock = { $gt: 0 };
        }
        else if (inStock === "false") {
            query.stock = { $lte: 0 };
        }
    }
    if (hasDiscount !== undefined) {
        if (hasDiscount === "true") {
            query.priceAfterDiscount = { $exists: true, $ne: null };
            query.$expr = { $lt: ["$priceAfterDiscount", "$price"] };
        }
        else if (hasDiscount === "false") {
            query.$or = [
                { priceAfterDiscount: { $exists: false } },
                { priceAfterDiscount: null },
                { priceAfterDiscount: { $gte: "$price" } },
            ];
        }
    }
    const products = await Product.find(query)
        .sort({ createdAt: -1, updatedAt: -1 })
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    const totalProducts = await Product.countDocuments(query);
    successMsg(res, 200, "Products fetched successfully", {
        products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / productPerPage),
        totalProducts,
    });
});
// GET PRODUCT BY ID
const getProductById = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "No Product found with this id");
        return;
    }
    successMsg(res, 200, "Product fetched successfully", product);
});
const updateProduct = asyncHandler(async (req, res) => {
    const { error, success } = validateUpdateProduct(req.body);
    if (!success) {
        sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
        return;
    }
    // Product Id
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "No Product found with this id");
        return;
    }
    const files = req.files;
    let updatedImages = [];
    if (req.body.existingImages) {
        updatedImages =
            typeof req.body.existingImages === "string"
                ? JSON.parse(req.body.existingImages)
                : req.body.existingImages;
    }
    else {
        updatedImages = product.productImages;
    }
    if (files && files.length > 0) {
        const uploadedFiles = files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "Products",
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
            };
        });
        const newUploadedImages = await Promise.all(uploadedFiles);
        if (!newUploadedImages) {
            sendError(res, 500, "Failed to upload images");
            return;
        }
        updatedImages.push(...newUploadedImages);
    }
    const updatedProduct = await Product.findByIdAndUpdate(productId, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            priceAfterDiscount: req.body.priceAfterDiscount,
            stock: req.body.stock,
            category: req.body.category,
            productImages: updatedImages,
        },
    }, { returnDocument: "after", runValidators: true });
    if (!updatedProduct) {
        sendError(res, 500, "Failed to update Product");
        return;
    }
    successMsg(res, 200, "Product updated successfully", updatedProduct);
});
// DELETE PRODUCT
const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "No Product found with this id");
        return;
    }
    await Product.findByIdAndDelete(productId);
    successMsg(res, 200, "Product deleted successfully", null);
});
//
const toggleLikeProduct = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user?.id;
    const product = await Product.findById(productId);
    if (!product) {
        sendError(res, 404, "No Product found with this id");
        return;
    }
    const isLiked = (product.likes || []).some((like) => like?.toString() === userId?.toString());
    let updatedProduct;
    if (isLiked) {
        updatedProduct = await Product.findByIdAndUpdate(productId, {
            $pull: { likes: userId },
            $set: { likesCount: Math.max(0, (product.likesCount || 1) - 1) },
        }, { returnDocument: "after", runValidators: true });
        if (!updatedProduct) {
            sendError(res, 500, "Failed to Unlike Product");
            return;
        }
        successMsg(res, 200, "Product unliked successfully", updatedProduct);
    }
    else {
        updatedProduct = await Product.findByIdAndUpdate(productId, {
            $addToSet: { likes: userId },
            $set: { likesCount: (product.likesCount || 0) + 1 },
        }, { returnDocument: "after", runValidators: true });
        if (!updatedProduct) {
            sendError(res, 500, "Failed to Like Product");
            return;
        }
        successMsg(res, 200, "Product liked successfully", updatedProduct);
    }
});
// UPDATE PRODUCT STOCK
const updateStockAfterPayment = async (orderItems) => {
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product)
            continue;
        product.stock = Math.max(0, product.stock - item.quantity);
        if (product.stock === 0) {
            product.isOutOfStock = true;
        }
        await product.save();
    }
};
// GET PRODUCT AUTOCOMPLETE SUGGESTIONS
const getProductSuggestions = asyncHandler(async (req, res) => {
    const q = (req.query.q || req.query.search || "").trim();
    if (!q) {
        successMsg(res, 200, "Suggestions fetched successfully", {
            products: [],
            categories: [],
        });
        return;
    }
    const safeRegex = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(safeRegex, "i");
    const categoriesList = [
        "Electronics",
        "Clothes",
        "Shoes",
        "Furniture",
        "Bags",
        "Books",
        "Accessories",
        "Watches & Accessories",
        "Luxury Fragrances",
        "Eyewear",
        "Leather Goods",
    ];
    const matchingCategories = categoriesList.filter((cat) => regex.test(cat));
    const products = await Product.find({
        $or: [
            { title: { $regex: safeRegex, $options: "i" } },
            { description: { $regex: safeRegex, $options: "i" } },
            { category: { $regex: safeRegex, $options: "i" } },
        ],
    })
        .select("title description category price priceAfterDiscount productImages stock")
        .limit(6);
    successMsg(res, 200, "Suggestions fetched successfully", {
        products,
        categories: matchingCategories,
    });
});
export { createProduct, getAllProducts, getProductById, getProductSuggestions, updateProduct, deleteProduct, toggleLikeProduct, updateStockAfterPayment, };
//# sourceMappingURL=product.controller.js.map