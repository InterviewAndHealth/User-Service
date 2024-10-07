const express = require("express");
const { Service } = require("../services");
const { BadRequestError, UnauthorizedError, InternalServerError } = require("../utils/errors");
const passport = require("passport");
const authMiddleware = require('../middlewares/auth');
const validateMiddleware = require('../middlewares/validate');
const { UserSchema, StudentSchema } = require('../schemas')
const { s3, upload, uploadFileToS3 } = require("../config/awsconfig")
const { oauth2Client } = require('../config/googleconfig');
const axios = require('axios');


const router = express.Router();
const service = new Service();
const userSchema = new UserSchema();
const studentSchema = new StudentSchema();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the users API" });
});

router.post("/login", validateMiddleware(userSchema.loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const data = await service.login(email, password);
  return res.status(200).json(data);
});

router.post("/register", validateMiddleware(userSchema.registerSchema), async (req, res) => {
  const { email, password } = req.body;


  const data = await service.register(email, password);
  return res.status(201).json(data);
});



router.get("/allusers", authMiddleware, async (req, res) => {
  const data = await service.getAllUsers();
  return res.json(data);
});

router.get('/google', async (req, res) => {
  const code = req.query.code;

  const googleRes = await oauth2Client.getToken(code);


  if (!googleRes)
    throw new BadRequestError("Unable to fetch token");

  oauth2Client.setCredentials(googleRes.tokens);
  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
  );


  if (!userRes)
    throw new UnauthorizedError("Unable to fetch google profile")


  const data = await service.googleAuth(userRes.data.id, userRes.data.email);

  res.status(200).json(data);


});







//student profile routes

router.post("/StudentProfile", authMiddleware, validateMiddleware(studentSchema.profileSchema), async (req, res) => {
  const { firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity } = req.body;

  const userId = req.userId;
  const data = await service.createStudentProfile(firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity, userId);
  return res.status(201).json(data);

});

router.put("/StudentProfile", authMiddleware, async (req, res) => {
  const { firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity, resumeLink } = req.body;

  const userId = req.userId;
  const data = await service.updateStudentProfile(firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity, resumeLink, userId);
  return res.status(204).json(data);

});

router.get("/StudentProfile", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const data = await service.getStudentProfile(userId);
  return res.status(200).json(data);
});



router.post("/studentprofilewithresume", authMiddleware, upload.single('file'), validateMiddleware(studentSchema.profileSchema), async (req, res) => {
  const { firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity } = req.body;

  // console.log(req.body);

  const filePath = req.file.path;
  const fileName = req.file.filename;

  // console.log(filePath);
  // console.log(fileName);

  const resumeLink = await uploadFileToS3(filePath, fileName);
  // console.log(resumeLink);

  const userId = req.userId;
  const data = await service.createStudentProfilewithresume(firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity, resumeLink, userId);
  return res.status(201).json(data);

});


//resume routes




// Upload resume
router.post('/uploadresume', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.filename;

    // console.log(filePath);
    // console.log(fileName);

    const fileUrl = await uploadFileToS3(filePath, fileName);
    // console.log(fileUrl);

    res.status(200).json({
      message: 'Resume uploaded successfully',
      resumeUrl: fileUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Update resume
router.post('/updateresume', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    // const { username} = req.body;
    const userid = req.userId
    const oldFileName = `${userid}.${req.file.originalname.split('.').pop()}`;

    const filePath = req.file.path;
    const newFileName = req.file.filename;

    // Find the old file on S3
    const oldFile = `${oldFileName}.${req.file.originalname.split('.').pop()}`;

    // Delete old file from S3 before uploading the new one
    s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: oldFile,
    }, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Upload new file to S3
      const fileUrl = await uploadFileToS3(filePath, newFileName);
      res.status(201).json({
        message: 'Resume updated successfully',
        resumeUrl: fileUrl,
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete resume
router.delete('/deleteresume', authMiddleware, async (req, res) => {
  try {
    const userid = req.userId
    // const fileName = `${userid}.${req.file.originalname.split('.').pop()}`;
    const fileName = `${userid}.pdf`;

    // const filePath = req.file.path;

    // Delete the file from S3
    s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
    }, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      //else {
      //   //Remove the file from the local uploads folder
      //   fs.unlinkSync(filePath);
      //   resolve(data.Location);
      // }

      res.status(200).json({ message: 'Resume deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






// const { EventService, RPCService } = require("../services/broker");

// router.get("/rpctest",authMiddleware, async (req, res) => {
//   // const {jobdescription, interviewtype, difficulty, jobfield, status } = req.body;

  
//   const userid=req.userId;
//   const interviewId="xr56gw4nt0x5";
//   console.log(userid);
//   const response = await RPCService.request('INTERVIEWS_SCHEDULE_RPC', {
//     type: 'GET_INTERVIEW_DETAILS',
//     data:{
//       interviewId
//     },
//   });
//   console.log(response);
  
//   return res.json(response);
// });

module.exports = router;
