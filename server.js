const express = require("express");
require("express-async-errors");
const cors = require("cors");
const error = require("./middlewares/error");
const routes = require("./api/routes");
const { DB } = require("./database");
const passport = require('passport');

module.exports = async (app) => {
  await DB.connect();

  app.use(passport.initialize())
  app.use(express.json());
  app.use(cors());
  app.use(routes);
  app.use(error);
};
