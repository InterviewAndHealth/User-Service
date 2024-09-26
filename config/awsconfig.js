const AWS = require('aws-sdk');
const multer = require('multer');
const fs=require("fs");
const{AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_REGION,AWS_S3_BUCKET_NAME}= require("../config");

// Configure AWS SDK
const s3 = new AWS.S3({
    accessKeyId:AWS_ACCESS_KEY_ID,
    secretAccessKey:AWS_SECRET_ACCESS_KEY,
    region:AWS_REGION,
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Store files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        // const { username} = req.body;
        const userid=req.userId;
        console.log("hello");
        const uniqueName = `${userid}.${file.originalname.split('.').pop()}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage: storage });



const uploadFileToS3 = (filePath, fileName) => {
    return new Promise((resolve, reject) => {
        const fileContent = fs.readFileSync(filePath);

        const params = {
            Bucket:AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: fileContent,
            // ACL: 'public-read',
        };

        s3.upload(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                //Remove the file from the local uploads folder
                fs.unlinkSync(filePath);
                resolve(data.Location);
            }
        });
    });
};


module.exports = {s3,upload,uploadFileToS3};