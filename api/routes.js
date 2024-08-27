const express = require("express");
const { Service } = require("../services");
const { BadRequestError } = require("../utils/errors");

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

  const data = await service.register(email, password, name);
  return res.json(data);
});

router.get("/rpc", async (req, res) => {
  const data = await service.rpc_test();
  return res.json(data);
});

module.exports = router;
