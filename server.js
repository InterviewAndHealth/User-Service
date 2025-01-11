const express = require("express");
require("express-async-errors");
const cors = require("cors");
const error = require("./middlewares/error");
const routes = require("./api/routes");
const { DB } = require("./database");
const passport = require("passport");
const { UserService } = require("./services/rpcandeventservice");
const { SERVICE_QUEUE } = require("./config");
var bodyParser = require("body-parser");
const RPCService = require("./services/broker/rpc");
const EventService = require("./services/broker/events");

const multer = require("multer");
const Broker = require("./services/broker/broker");

const upload = multer();

module.exports = async (app) => {
  await DB.connect();

  app.use(passport.initialize());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());
  app.use(routes);
  app.use(error);
  app.use(upload.array());

  const userservice = new UserService();
  await Broker.connect();
  await EventService.subscribe(SERVICE_QUEUE, userservice);
  await RPCService.respond(userservice);
};
