const joi = require('joi');
//firstName, lastName, contactNumber, email, gender, city, country, skills, preparingFor, workMode, preferredCity, userId
class StudentSchema {

  profileSchema = joi.object().keys({
    firstName: joi.string().min(2).required(),
    lastName: joi.string().min(2).required(),
    contactNumber: joi.string()
      .required(),
    gender: joi.string().required(),
    city: joi.string().required(),
    country: joi.string().required(),
    skills: joi.array().items(joi.string().min(2)).required(),
    preparingFor: joi.string().required(),
    workMode: joi.string().required(),
    preferredCity: joi.string().required(),
  })

}

module.exports = StudentSchema;