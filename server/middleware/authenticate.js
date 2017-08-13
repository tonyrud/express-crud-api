const {User} = require('./../models/user')

const authenticate = (req, res, next) => {
  const token = req.header('x-auth')

  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject()
      }
      req.user = user
      req.token = token
      next()
    })
    .catch(err => {
      res.status(401).send()
    })
}

const catchErrors = fn => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next)
  }
}

module.exports = {authenticate, catchErrors}