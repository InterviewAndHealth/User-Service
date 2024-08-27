const { EventService, RPCService } = require("./broker");

module.exports = {
  Service: require("./service"),
  EventService,
  RPCService,
};
