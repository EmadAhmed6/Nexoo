import multer from "multer";
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({
    dest: "uploads",
    limits: { fileSize: 100 * 1024 * 1024 },
});
export default upload;
//# sourceMappingURL=multer.js.map