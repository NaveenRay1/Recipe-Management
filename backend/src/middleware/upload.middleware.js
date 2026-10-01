const multer = require("multer");
const ApiError = require("../utils/ApiError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new ApiError(400, "Only image files are allowed"));
  },
});

module.exports = upload;