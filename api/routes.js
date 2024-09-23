const express = require("express");
const { Service } = require("../services");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");
const passport = require("passport");
const authMiddleware = require('../middlewares/auth');
const validateMiddleware = require('../middlewares/validate');
const { UserSchema,StudentSchema } = require('../schemas')

// const s3 = require('../config/awsconfig');
// const upload = require('../middlewares/fileuplaod');

const router = express.Router();
const service = new Service();
const userSchema = new UserSchema();
const studentSchema=new StudentSchema();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the users API" });
});

router.post("/login", validateMiddleware(userSchema.loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const data = await service.login(email, password);
  return res.json(data);
});

router.post("/register", validateMiddleware(userSchema.registerSchema), async (req, res) => {
  const { email, password } = req.body;


  const data = await service.register(email, password);
  return res.json(data);
});



router.get("/allusers", authMiddleware, async (req, res) => {
  const data = await service.getAllUsers();
  return res.json(data);
});

router.get('/google', passport.authenticate('google', {
  scope:
    ['email', 'profile']
}
));

router.get('/login/google/callback', passport.authenticate('google', {
  failureRedirect: '/failure',
  session: false
}), async (req, res) => {

  if (!req.user)
    throw new UnauthorizedError("Access Denied");

  const {
    id,
    firstName,
    lastName,
    email,
  } = req.user;

  const data = await service.googleAuth(id, email, firstName, lastName);
  return res.status(200).json(data);
})

router.get("/failure", (req, res) => {
  res.send("Failed to log in with Google.");
});

router.get("/rpc", async (req, res) => {
  const data = await service.rpc_test();
  return res.json(data);
});








router.post("/StudentProfile",authMiddleware, validateMiddleware(studentSchema.profileSchema), async (req, res) => {
  const { firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity} = req.body;

  // if (!firstName || !lastName || !contactNumber || !email || !gender || !city || !country || !skills || !preparingFor || !workMode || !preferredCity || !userId)
  //   throw new BadRequestError("Incomplete Data");
  const userId=req.userId;
  const data = await service.createStudentProfile(firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity, userId);
  return res.json(data);

});

router.put("/StudentProfile",authMiddleware, async (req, res) => {
  const { firstName,lastName,contactNumber,gender,city,country,skills,preparingFor,workMode,preferredCity } = req.body;
  
  const userId=req.userId;
  const data = await service.updateStudentProfile(firstName,lastName,contactNumber,gender,city,country,skills,preparingFor,workMode,preferredCity,userId);
  return res.json(data);

});




//resume routes

// // Upload resume
// router.post('/uploadresume', upload.single('resume'), async (req, res) => {
//   const fileUrl = req.file.location;  // Multer-S3 gives the public file URL in `location`
//  return res.json({
//       message: 'Resume uploaded successfully',
//       resumeUrl: fileUrl
//   });
// });

// // Update resume
// router.post('/updateresume', upload.single('resume'),async (req, res) => {
//   const { username, userid } = req.body;
//   const oldFileName = `${username}-${userid}`;

//   try {
//       // Delete old file
//       await s3.deleteObject({
//           Bucket: process.env.AWS_S3_BUCKET_NAME,
//           Key: oldFileName
//       }).promise();

//       const newFileUrl = req.file.location;
//      return res.json({
//           message: 'Resume updated successfully',
//           resumeUrl: newFileUrl
//       });
//   } catch (error) {
//       res.status(500).send('Error updating the resume.');
//   }
// });

// // Delete resume
// router.delete('/deleteresume', async (req, res) => {
//   const { username, userid } = req.body;
//   const fileName = `${username}-${userid}`;

//   try {
//       await s3.deleteObject({
//           Bucket: process.env.AWS_S3_BUCKET_NAME,
//           Key: fileName
//       }).promise();
//       res.json({ message: 'Resume deleted successfully' });
//   } catch (error) {
//       res.status(500).send('Error deleting the resume.');
//   }
// });

module.exports = router;
