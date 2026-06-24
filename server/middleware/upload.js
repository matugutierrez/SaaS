const multer = require('multer');

const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');

module.exports = { uploadMiddleware };
