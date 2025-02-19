const { Repository } = require("../database");
// A mock function to simulate user lookup
const { getSignedUrlForRead } = require("../config/awsconfig");
class UserService {
  constructor() {
    this.repository = new Repository();
  }

  async respondRPC(request) {
    console.log("Received request", request);

    if (request.type === "CHECK_USER_EXISTENCE") {
      // console.log(request);
      const { userid } = request.data;
      // Logic to check if user exists (e.g., query the database)
      // console.log(userid);
      const user = await this.repository.getUserbyid(userid);
      // console.log(user);
      const profile = await this.repository.getStudent(userid);
      // console.log(profile);

      const userExists = !!(user && profile);

      // Return the response
      return { data: userExists };
    } else if (request.type === "GET_USER_RESUME") {
      const { userId } = request.data;
      // console.log(userId);

      const profile = await this.repository.getStudent(userId);

      if (!profile) {
        return { data: "Student Profile not found" };
      }

      const filename = `${userId}.pdf`;
      const signedUrl = await getSignedUrlForRead(filename);
      // console.log(signedUrl);
      return { data: signedUrl };
    } else if (request.type === "GET_USER_DETAILS") {
      const { userId } = request.data;

      const profile = await this.repository.getStudent(userId);

      if (!profile) {
        return { datafound: 0, data: "Student Profile not found" };
      }

      return { datafound: 1, data: profile };
    } else if (request.type === "GET_APPLICANT_DETAILS") {
      const { userId } = request.data;

      const user = await this.repository.getUserbyid(userId);

      const profile = await this.repository.getStudent(userId);

      if (!profile || !user) {
        return null;
      }

      const filename = `${userId}.pdf`;
      const signedUrl = await getSignedUrlForRead(filename);

      return { user, profile, signedUrl };
    } else if (request.type === "GET_RECRUITER_DETAILS") {
      const { userId } = request.data;

      const user = await this.repository.getUserbyid(userId);

      if (user.userrole !== "recruiter") {
        return null;
      }

      const profile = await this.repository.getRecruiter(userId);

      return { user, profile };
    }else if(request.type === "TALENTPOOL_GET_ALL_STUDENT_USERS") {
      
      const data = await this.repository.getAllStudents();

      return data ;
    }





    // else if(request.type === "GET_APPLICANT_RESUMES") {
    //   const{applications}=request.data;

    //   const results = await Promise.all(
    //     applications.map(async (application) => {
    //         const { applicant_user_id, resume_link } = application;

    //         // Generate signed URL only if resume_link exists
    //         const resumeSignedUrl = resume_link? await getSignedUrlForRead(`${applicant_user_id}.pdf`): null;

    //         // Return the application data with the additional field
    //         return {
    //             ...application,
    //             resumeSignedUrl,
    //         };
    //     })
    // );

    // return results;

    // }

    return { data: "Invalid request" };
  }

  async handleEvent(event) {
    console.log("Received event", event);
  }
}

module.exports = { UserService };
