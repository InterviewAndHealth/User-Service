const { customAlphabet } = require("nanoid");
const DB = require("./db");

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

// Repository will be used to interact with the database
class Repository {
  // Get user by email
  async getUser(email) {
    const result = await DB.query({
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    });
    return result.rows[0];
  }

  // Create a new user
  async createUser(email, password, name) {
    const id = nanoid();

    const result = await DB.query({
      text: "INSERT INTO users (public_id, email, password, name) VALUES ($1, $2, $3, $4) RETURNING *",
      values: [id, email, password, name],
    });

    return result.rows[0];
  }

  async getAllUsers(){
    const result = await DB.query("SELECT * FROM users");
    return result.rows;
  }


// functions for insertiong in student table
  async createStudent(firstName,lastName,contactNumber,email,gender,city,country,skills,preparingFor,workMode,preferredCity,userId) {
    const result = await DB.query({
      text: "INSERT INTO students (firstname, lastname, contactnumber, email, gender, city, country, skills, preparingfor, workmode, preferedcity, userid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      values: [
        firstName, lastName, contactNumber, email, gender, city, country,
        skills, preparingFor, workMode, preferredCity, userId
      ],
    });
  
    return result.rows[0];
  }


  async getStudent(userId) {
    const result = await DB.query({
      text: "SELECT * FROM students WHERE userid = $1",
      values: [userId],
    });
    return result.rows[0];
  }
  
}

module.exports = Repository;
