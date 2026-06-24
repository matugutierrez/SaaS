const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { MONGO_URI } = require('../config/env');

const storage = new GridFsStorage({
  url: MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: Date.now() + '-' + file.originalname,
    };
  },
});

const uploadMiddleware = multer({ storage }).single('file');

module.exports = { uploadMiddleware };
