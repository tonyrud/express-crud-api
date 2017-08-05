const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    unique: true,
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minLength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        require: true
      },
      token: {
        type: String,
        require: true
      }
    }
  ]
})

UserSchema.methods.toJSON = function () { 
  const user = this
  const userObject = user.toObject()

  return _.pick(userObject, ['_id','email'])
 }

UserSchema.methods.generateAuthToken = function() {
  const user = this
  const access = 'auth'
  const token = jwt
    .sign({ _id: user._id.toHexString(), access }, 'abc123')
    .toString()

  user.tokens.push({
    access,
    token
  })

  return user.save().then((data) => {
    return token
  })
  .catch(err => {
    throw Error(err)
  })
}

module.exports = mongoose.model('User', UserSchema)
