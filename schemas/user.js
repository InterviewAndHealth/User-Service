const joi = require('joi');

class UserSchema {

  loginSchema = joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().min(5).required()
  })

  registerSchema = joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
    // name: joi.string().min(2).required()
  })

}

module.exports = UserSchema;