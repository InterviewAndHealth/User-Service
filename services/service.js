const bcrypt = require("bcrypt");
const { Repository } = require("../database");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const { EventService, RPCService } = require("./broker");
const { EVENT_TYPES, TEST_QUEUE, TEST_RPC,PAYMENT_QUEUE } = require("../config");
const Token = require('../utils/token')
const {getSignedUrlForRead}=require('../config/awsconfig')
const sendEmail = require("../utils/mail")
const {STUDENT_COUPON_CODE, RECRUITER_COUPON_CODE} = require("../config")

// Service will contain all the business logic
class Service {
  constructor() {
    this.repository = new Repository();
    this.token = new Token();
  }

  async sendWelcomeEmail(email, role) {
    const options = {
      to: email,
      subject:
        "Welcome to IamreadyAI - Your Partner in Job Preparation and Search",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #4CAF50;">Welcome to IamreadyAI!</h2>
              <p style="font-size: 16px;">
                Thank you for registering with IamreadyAI!
              </p>
              
              <p style="font-size: 16px; line-height: 1.5;">
                You can now start practicing real-time interviews and check your rankings to boost your job preparation efforts.
              </p>
              
              <div style="background-color: #f9f9f9; padding: 10px; margin-top: 20px; border-left: 4px solid #4CAF50; font-size: 16px;">
                <strong>Exclusive Offer for You!</strong><br>
                Please use coupon code <strong><span style="color: #4CAF50;">${
                  role === "student"
                    ? STUDENT_COUPON_CODE
                    : RECRUITER_COUPON_CODE
                }</span></strong> for your first interview to get 50% discount.
              </div>
              
              <p style="font-size: 16px; line-height: 1.5;">
                Lets succeed together.<br>
                IamreadyAI Team
              </p>
            </div>
          </body>
        </html>
      `,
    }

    return await sendEmail(options)
  }

  async recruiterLogin(email, password) {
    const user = await this.repository.getUser(email);
    if (!user) throw new NotFoundError("User not found");
    if (user.userrole !== "recruiter")
      throw new BadRequestError("Not a recruiter account");

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestError("Invalid password");

    const recruiter = await this.repository.getRecruiter(user.public_id);
    // console.log(recruiter);

    const authToken = this.token.generateToken(
      {
        sub: user.public_id,
        role: user.userrole,
        companyLocation: recruiter.companyLocation,
      },
      "1d"
    );

    return { message: "Login successful", authToken };
  }

  async recruiterRegister(
    email,
    password,
    firstName,
    lastName,
    contactNumber,
    companyName,
    companyLocation
  ) {
    const user = await this.repository.getUser(email);
    if (user) throw new BadRequestError("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.repository.createRecruiter(
      email,
      hashedPassword,
      firstName,
      lastName,
      contactNumber,
      companyName,
      companyLocation
    );

    const recruiter = await this.repository.getRecruiter(newUser.public_id);
    // console.log(recruiter);

    const authToken = this.token.generateToken(
      {
        sub: newUser.public_id,
        role: "recruiter",
        companyLocation: recruiter.companyLocation,
      },
      "1d"
    );

    await this.sendWelcomeEmail(email, "recruiter")

    return { message: "Recruiter created successfully", authToken };
  }

  // Login method will be used to authenticate the user
  async login(email, password) {
    const user = await this.repository.getUser(email);

    if (!user) throw new NotFoundError("User not found");

    if (user.authtype != "normal")
      throw new BadRequestError("User logged in through other social account");

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestError("Invalid password");

    const student = await this.repository.getStudent(user.public_id);

    const authToken = this.token.generateToken(
      {
        sub: user.public_id,
        // country: student.country,
        role: user.userrole,
      },
      "1d"
    );

    return {
      message: "Login successful",
      authToken,
    };
  }

  // Register method will be used to create a new user
  async register(email, password,referral_code) {
    const user = await this.repository.getUser(email);
    if (user) throw new BadRequestError("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.repository.createUser(
      email,
      hashedPassword,
      "normal"
    );

    // const student = await this.repository.getStudent(newUser.user_id);
    // console.log(student);

    const authToken = this.token.generateToken(
      {
        sub: newUser.public_id,
        // country: student.country,
        role: newUser.userrole,
      },
      "1d"
    );

    EventService.publish(PAYMENT_QUEUE, {
      type: EVENT_TYPES.USER_CREATED,
      data: {
        userId: newUser.public_id,
        referral_code: referral_code
      },
    });

    await this.sendWelcomeEmail(email, "student")

    return {
      message: "User created successfully",
      authToken,
    };
  }

  async googleAuth(googleId, email) {
    const user = await this.repository.getUser(email);
    if (!user) {
      const hashedPassword = await bcrypt.hash(googleId, 10);
      const newUser = await this.repository.createUser(
        email,
        hashedPassword,
        "google"
      );

      const authToken = this.token.generateToken(
        {
          sub: newUser.public_id,
          // country: student.country,
          role: newUser.userrole,
        },
        "1d"
      );

       EventService.publish(PAYMENT_QUEUE, {
        type: EVENT_TYPES.USER_CREATED,
        data: {
          userId: newUser.public_id,
        },
      });

      await this.sendWelcomeEmail(email, "student")

      return {
        message: "User created successfully",
        authToken,
      };
    } else {
      if (user.authtype == "google") {

        const student = await this.repository.getStudent(user.user_id);

        const authToken = this.token.generateToken(
          {
            sub: user.public_id,
            // country: student.country,
            role: user.userrole,
          },
          "1d"
        );

        return {
          message: "Login successful",
          authToken,
        };
      } else {
        throw new BadRequestError("Email registered without google login");
      }
    }
  }

  // async rpc_test() {
  //   const data = await RPCService.request(TEST_RPC, {
  //     type: TEST_RPC,
  //     data: "Requesting data",
  //   });

  //   return data;
  // }

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
  async createStudentProfile(
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
    const student = await this.repository.getStudent(userId);
    if (student) throw new BadRequestError("Student Profile already exists");

    const user = await this.repository.getUserByNumber(contactNumber);

    if (user) throw new BadRequestError("Contact Number already exists");

    const newStudent = await this.repository.createStudent(
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
    );

    return {
      message: "Student Profile created successfully",
      newStudent,
    };
  }

  async updateStudentProfile(
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
    const student = await this.repository.getStudent(userId);
    if (!student) throw new BadRequestError("Student Profile does not exists");

    const newStudent = await this.repository.updateStudent(
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
    );

    return {
      message: "Student Profile updated successfully",
      newStudent,
    };
  }

  async getStudentProfile(userId) {
    const student = await this.repository.getStudent(userId);
    if (!student) throw new NotFoundError("Student Profile not found");
    const user = await this.repository.getUserbyid(userId);
    if (!user) throw new NotFoundError("User not found");
    return {
      message: "Student Profile updated successfully",
      student,
      user,
    };
  }

  async createStudentProfilewithresume(
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
    const student = await this.repository.getStudent(userId);
    if (student) throw new BadRequestError("Student Profile already exists");

    const user = await this.repository.getUserByNumber(contactNumber);

    if (user) throw new BadRequestError("Contact Number already exists");

    const newStudent = await this.repository.createStudentProfileWithResume(
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
    );

    return {
      message: "Student Profile created successfully",
      newStudent,
    };

  }



  async getResume(userId){

    const filename=`${userId}.pdf`;
      const signedUrl=await getSignedUrlForRead(filename);
      // console.log(signedUrl);
      return { data:signedUrl};
    
  }
}

module.exports = Service;
