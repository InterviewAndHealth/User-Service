const express = require("express");
const { Service } = require("../services");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");
const passport = require("passport");
const authMiddleware = require('../middlewares/auth');
const validateMiddleware = require('../middlewares/validate');
const { UserSchema } = require('../schemas')


const router = express.Router();
const service = new Service();
const userSchema = new UserSchema();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the users API" });
});

router.post("/login", validateMiddleware(userSchema.loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const data = await service.login(email, password);
  return res.json(data);
});

router.post("/register", validateMiddleware(userSchema.registerSchema), async (req, res) => {
  const { email, password, name } = req.body;


  const data = await service.register(email, password, name);
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








router.post("/StudentProfile", authMiddleware, async (req, res) => {
  const { firstName, lastName, contactNumber, email, gender, city, country, skills, preparingFor, workMode, preferredCity, userId } = req.body;

  if (!firstName || !lastName || !contactNumber || !email || !gender || !city || !country || !skills || !preparingFor || !workMode || !preferredCity || !userId)
    throw new BadRequestError("Incomplete Data");

  const data = await service.createStudentProfile(firstName, lastName, contactNumber, email, gender, city, country, skills, preparingFor, workMode, preferredCity, userId);
  return res.json(data);

});

router.put("/StudentProfile",authMiddleware, async (req, res) => {
  const { firstName,lastName,contactNumber,email,gender,city,country,skills,preparingFor,workMode,preferredCity,userId } = req.body;
  

  const data = await service.updateStudentProfile(firstName,lastName,contactNumber,email,gender,city,country,skills,preparingFor,workMode,preferredCity,userId);
  return res.json(data);

});

module.exports = router;
