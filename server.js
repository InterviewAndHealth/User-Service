const express = require("express");
require("express-async-errors");
const cors = require("cors");
const error = require("./middlewares/error");
const routes = require("./api/routes");
const { DB } = require("./database");
const passport = require('passport');
const { UserService } = require("./services/rpcandeventservice");

const multer=require('multer');

const upload=multer();

var bodyParser = require('body-parser');

const RPCService = require('./services/broker/rpc');
const EventService = require('./services/broker/events');

module.exports = async (app) => {
  await DB.connect();

  app.use(passport.initialize())
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cors());
  app.use(routes);
  app.use(error);
  app.use(upload.array());

  // console.log(UserService);

  const userservice=new UserService();

  await RPCService.respond(userservice);

  EventService.subscribe('USER_SERVICE', userservice);


  
};
