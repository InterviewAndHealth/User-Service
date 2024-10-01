const bcrypt = require("bcrypt");
const { Repository } = require("../database");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const { EventService, RPCService } = require("./broker");
const { EVENT_TYPES, TEST_QUEUE, TEST_RPC } = require("../config");
const Token = require('../utils/token')

// Service will contain all the business logic
class Service {
  constructor() {
    this.repository = new Repository();
    this.token = new Token();
  }

  // Login method will be used to authenticate the user
  async login(email, password) {

      const user = await this.repository.getUser(email);

    if (!user) throw new NotFoundError("User not found");

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestError("Invalid password");

    const authToken = this.token.generateToken({
      sub: user.public_id
    }, '1d');

    return {
      message: "Login successful",
      authToken
    };
    
  }

  // Register method will be used to create a new user
  async register(email, password) {

      const user = await this.repository.getUser(email);
    if (user) throw new BadRequestError("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.repository.createUser(
      email,
      hashedPassword,
    );

    const authToken = this.token.generateToken({
      sub: newUser.public_id
    }, '1d');

    EventService.publish(TEST_QUEUE, {
      type: EVENT_TYPES.USER_CREATED,
      data: {
        userId: newUser.public_id,
        email: newUser.email,
      },
    });

    return {
      message: "User created successfully",
      authToken
    };
      
  
  }


  async googleAuth(googleId, email, firstname, lastname) {
    const user = await this.repository.getUser(email);
    if (!user) {
      const hashedPassword = await bcrypt.hash(googleId + firstname + lastname, 10);
      const newUser = await this.repository.createUser(
        email,
        hashedPassword,
        firstname + " " + lastname
      );

      const authToken = this.token.generateToken({
        sub: newUser.id
      }, '1d');

      return {
        message: "User created successfully",
        authToken
      };
    }
    else {


      const authToken = this.token.generateToken({
        sub: user.id
      }, '1d');

      return {
        message: "Login successful",
        authToken
      };
    }
  }

  async rpc_test() {
    const data = await RPCService.request(TEST_RPC, {
      type: TEST_RPC,
      data: "Requesting data",
    });

    return data;
  }

  async getAllUsers() {
    const users = await this.repository.getAllUsers();
    return users.map((user) => ({
      id: user.public_id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    }));
  }

  //createStudentProfile function is used create Student Profile  
  async createStudentProfile(firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity, userId) {

      const student = await this.repository.getStudent(userId);
      if (student) throw new BadRequestError("Student Profile already exists");


    const newStudent = await this.repository.createStudent(firstName, lastName, contactNumber, gender, city, country, skills, preparingFor, workMode, preferredCity, userId);

    return {
      message: "Student Profile created successfully",
      newStudent
    };
    
  }


  async updateStudentProfile(firstName,lastName,contactNumber,gender,city,country,skills,preparingFor,workMode,preferredCity,resumeLink,userId){

    const student = await this.repository.getStudent(userId);
    if (!student) throw new BadRequestError("Student Profile does not exists");

      const newStudent = await this.repository.updateStudent(firstName,lastName,contactNumber,gender,city,country,skills,preparingFor,workMode,preferredCity,resumeLink,userId);

    return{
      message: "Student Profile updated successfully",
      newStudent
    };
    
  }


  async getStudentProfile(userId){
    const student = await this.repository.getStudent(userId);
    if (!student) throw new NotFoundError("Student Profile not found");
    return {
      message: "Student Profile updated successfully",
      student
    };

  }





  
}

module.exports = Service;
