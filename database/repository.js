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

  async createRecruiter(
    email,
    password,
    firstName,
    lastName,
    contactNumber,
    companyName,
    companyLocation
  ) {
    const id = nanoid();
    const result = await DB.query({
      text: "INSERT INTO users (public_id, email, password, authtype, userrole) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      values: [id, email, password, "normal", "recruiter"],
    });

    // Add recruiter profile
    await DB.query({
      text: "INSERT INTO recruiter_profiles (user_id, first_name, last_name, contact_number, company_name, company_location) VALUES ($1, $2, $3, $4, $5, $6)",
      values: [
        id,
        firstName,
        lastName,
        contactNumber,
        companyName,
        companyLocation,
      ],
    });

    return result.rows[0];
  }

  getRecruiter = async (userId) => {
    const result = await DB.query({
      text: "SELECT * FROM recruiter_profiles WHERE user_id = $1",
      values: [userId],
    });
    return result.rows[0];
  };

  // Get user by conctact number
  async getUserByNumber(contactNumber) {
    const result = await DB.query({
      text: "SELECT * FROM students WHERE contactnumber = $1",
      values: [contactNumber],
    });
    return result.rows[0];
  }

  // Create a new user
  async createUser(email, password, authtype) {
    const id = nanoid();

    const result = await DB.query({
      text: "INSERT INTO users (public_id, email, password,authtype, userrole) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      values: [id, email, password, authtype, "student"],
    });

    return result.rows[0];
  }

  async getAllUsers() {
    const result = await DB.query("SELECT * FROM users");
    return result.rows;
  }

  // functions for insertiong in student table
  async createStudent(
    firstName,
    lastName,
    contactNumber,
    gender,
    city,
    country,
    skills,
    preparingFor,
    workMode,
    preferredCity,
    userId
  ) {
    const result = await DB.query({
      text: "INSERT INTO students (firstname, lastname, contactnumber, gender, city, country, skills, preparingfor, workmode, preferedcity, userid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
      values: [
        firstName,
        lastName,
        contactNumber,
        gender,
        city,
        country,
        skills,
        preparingFor,
        workMode,
        preferredCity,
        userId,
      ],
    });

    return result.rows[0];
  }


  async createAdminUser(
    email,
    hashedPassword,
    authtype,
    userrole
  ){

    const id = nanoid();

    const result = await DB.query({
      text: "INSERT INTO users (public_id,email, password, authtype, userrole) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      values: [id,email, hashedPassword, authtype, userrole],
    });

    return result.rows[0];

  }

  async updateStudent(
    firstName,
    lastName,
    contactNumber,
    gender,
    city,
    country,
    skills,
    preparingFor,
    workMode,
    preferredCity,
    resumeLink,
    userId
  ) {
    let updates = [];
    let values = [];

    if (firstName) {
      updates.push(`firstname = $${updates.length + 1}`);
      values.push(firstName);
    }
    if (lastName) {
      updates.push(`lastname = $${updates.length + 1}`);
      values.push(lastName);
    }
    if (contactNumber) {
      updates.push(`contactnumber = $${updates.length + 1}`);
      values.push(contactNumber);
    }
    // if (email) {
    //   updates.push(`email = $${updates.length + 1}`);
    //   values.push(email);
    // }
    if (gender) {
      updates.push(`gender = $${updates.length + 1}`);
      values.push(gender);
    }
    if (city) {
      updates.push(`city = $${updates.length + 1}`);
      values.push(city);
    }
    if (country) {
      updates.push(`country = $${updates.length + 1}`);
      values.push(country);
    }
    if (skills) {
      updates.push(`skills = $${updates.length + 1}`); // Assuming skills is stored as an array in PostgreSQL
      values.push(skills);
    }
    if (preparingFor) {
      updates.push(`preparingfor = $${updates.length + 1}`);
      values.push(preparingFor);
    }
    if (workMode) {
      updates.push(`workmode = $${updates.length + 1}`);
      values.push(workMode);
    }
    if (preferredCity) {
      updates.push(`preferedcity = $${updates.length + 1}`);
      values.push(preferredCity);
    }
    if (resumeLink) {
      updates.push(`resumelink = $${updates.length + 1}`);
      values.push(resumeLink);
    }

    // If no fields are provided for update, return an error
    if (updates.length === 0) {
      throw new BadRequestError("No fields provided for update");
    }

    // Add userId to values for the WHERE clause
    values.push(userId);

    const query = `
    UPDATE students
    SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE userid = $${values.length}
    RETURNING *;
  `;

    const result1 = await DB.query({
      text: query,
      values: values,
    });

    console.log(result1.rows[0]);

    const result2 = await DB.query({
      text: "SELECT * FROM students WHERE userid = $1",
      values: [userId],
    });

    return result2.rows[0];
  }

  async getStudent(userId) {
    const result = await DB.query({
      text: "SELECT * FROM students WHERE userid = $1",
      values: [userId],
    });
    return result.rows[0];
  }

  async getUserbyid(userId) {
    // console.log(userId);
    const result = await DB.query({
      text: "SELECT * FROM users WHERE public_id = $1",
      values: [userId],
    });
    return result.rows[0];
  }

  async updatePassword(userId,hashedPassword){

    const result = await DB.query({
      text: "UPDATE users SET password = $1 WHERE public_id = $2",
      values: [hashedPassword, userId],
    });

    return result.rows[0];

  }

  async createStudentProfileWithResume(
    firstName,
    lastName,
    contactNumber,
    gender,
    city,
    country,
    skills,
    preparingFor,
    workMode,
    preferredCity,
    resumeLink,
    userId
  ) {
    const result = await DB.query({
      text: "INSERT INTO students (firstname, lastname, contactnumber, gender, city, country, skills, preparingfor, workmode, preferedcity,resumelink, userid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      values: [
        firstName,
        lastName,
        contactNumber,
        gender,
        city,
        country,
        skills,
        preparingFor,
        workMode,
        preferredCity,
        resumeLink,
        userId,
      ],
    });

    return result.rows[0];
  }





//   async getAllStudents() {
//     const result = await DB.query({
//         text: `
//             SELECT 
//                 u.id, 
//                 u.public_id AS resume_id, 
//                 u.email AS candidate_email, 
//                 u.authtype, 
//                 u.userrole, 
//                 u.created_at AS user_created_at, 
//                 u.updated_at AS user_updated_at, 
//                 s.studentid, 
//                 s.firstname, 
//                 s.lastname, 
//                 s.contactnumber AS contact_number, 
//                 s.gender, 
//                 s.city, 
//                 s.country, 
//                 s.skills, 
//                 s.preparingfor, 
//                 s.workmode, 
//                 s.preferedcity, 
//                 s.resumelink, 
//                 s.created_at AS student_created_at, 
//                 s.updated_at AS student_updated_at
//             FROM users u
//             JOIN students s ON u.public_id = s.userid
//             WHERE u.userrole = 'student';
//         `
//     });
//     return result.rows;
// }

async getAllStudents() {
  const result = await DB.query({
    text: `
        SELECT 
            u.id, 
            u.public_id AS resume_id, 
            u.email AS candidate_email, 
            u.authtype, 
            u.userrole, 
            u.created_at AS user_created_at, 
            u.updated_at AS user_updated_at, 
            s.studentid, 
            s.firstname || ' ' || s.lastname AS candidate_name, 
            s.contactnumber AS contact_number, 
            s.gender, 
            s.city, 
            s.country, 
            array_to_string(s.skills, ', ') AS expertise, 
            s.preparingfor, 
            s.workmode, 
            s.preferedcity AS location_preference, 
            s.resumelink, 
            s.created_at AS student_created_at, 
            s.updated_at AS student_updated_at
        FROM users u
        JOIN students s ON u.public_id = s.userid
        WHERE u.userrole = 'student'
        LIMIT 2;
    `
  });
  return result.rows;
}



}

module.exports = Repository;
