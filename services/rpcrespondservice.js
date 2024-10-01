const RPCService = require('./broker/rpc');
const { Repository } = require("../database");
// A mock function to simulate user lookup


class UserService {
  constructor() {
    this.repository = new Repository();
  }
  
   async respondRPC(request) {
    if (request.type === 'CHECK_USER_EXISTENCE') {
      console.log(request);
      const{ userid } = request.data;
      // Logic to check if user exists (e.g., query the database)
      // console.log(userid);
      const user =await this.repository.getUserbyid(userid);
      // console.log(user);
      const profile=await this.repository.getStudent(userid);
      // console.log(profile);
     
      const userExists = !!(user && profile);

      // Return the response
      return { data:userExists };
    }
  }
}
module.exports = {UserService};
