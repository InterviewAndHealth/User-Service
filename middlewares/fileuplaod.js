const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/awsconfig');

// Multer configuration for file uploads to S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        key: function (req, file, cb) {
            const { username} = req.body;
            const userId=req.userId;
            const fileName = `${username}-${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;
            cb(null, fileName);  // Save with the unique name
        }
    })
});

module.exports = upload;