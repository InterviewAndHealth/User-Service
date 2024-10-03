
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
    }else if (request.type === 'GET_USER_PROFILE') {

      const{ userId } = request.data;

      const profile=await this.repository.getStudent(userId);

      return { data:profile};
    }
  }


  async handleEvent(event) {
    if (event.type === 'ABCD') {
     

      
    }
  }
}
module.exports = {UserService};








const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const crypto = require("crypto");

const {
  AWS_S3_BUCKET_NAME,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  SIGNED_URL_EXPIRATION,
} = require("../config");

const s3 = new S3Client({
  region: BUCKET_REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const addImage = async (file) => {
  const randomString = () => crypto.randomBytes(32).toString("hex");
  const fileName = randomString();

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
  } catch (error) {
    console.log("Error", error);
  }

  return fileName;
};

const deleteImage = async (fileName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.log("Error", error);
  }
};

const getSignedUrlForRead = async (fileName) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: SIGNED_URL_EXPIRATION,
  });

  return signedUrl;
};

module.exports = { addImage, deleteImage, getSignedUrlForRead };
