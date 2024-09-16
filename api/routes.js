const express = require("express");
const { Service } = require("../services");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");
const passport = require("passport");
const authMiddleware = require('../middlewares/auth')


const router = express.Router();
const service = new Service();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the users API" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new BadRequestError("Email and password are required");

  const data = await service.login(email, password);
  return res.json(data);
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name)
    throw new BadRequestError("Email, password, and name are required");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email))
    throw new BadRequestError("Invalid email format");

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








router.post("/StudentProfile",authMiddleware, async (req, res) => {
  const { firstName,lastName,contactNumber,email,gender,city,country,skills,preparingFor,workMode,preferredCity,userId } = req.body;


  if (!firstName||!lastName||!contactNumber||!email||!gender||!city||!country||!skills||!preparingFor||!workMode||!preferredCity||!userId)
    throw new BadRequestError("Incomplete Data");

  

  const data = await service.createStudentProfile(firstName,lastName,contactNumber,email,gender,city,country,skills,preparingFor,workMode,preferredCity,userId);
  return res.json(data);

});

module.exports = router;
