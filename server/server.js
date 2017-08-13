const env = require('./config/config').env
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')
const _ = require('lodash')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const { authenticate, catchErrors } = require('./middleware/authenticate')

let app = express()
const port = process.env.PORT

app.use(bodyParser.json())

app.post('/todos', authenticate, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })
  todo.save().then(
    doc => {
      res.send(doc)
    },
    e => {
      res.status(400).send(e)
    }
  )
})

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then(
    todos => {
      res.send({ todos })
    },
    e => {
      res.status(400).send(e)
    }
  )
})

app.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    return res.status(404).send()
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then(
    todo => {
      if (!todo) {
        return res.status(404).send()
      }
      res.send({ todo })
    },
    e => {
      res.status(400).send(e)
    }
  )
})

app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id
  if (!ObjectId.isValid(id)) {
    return res.status(404).send()
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then(
    todo => {
      if (!todo) {
        return res.status(404).send()
      }
      res.send({ todo })
    },
    e => {
      res.status(400).send(e)
    }
  )
})

app.patch('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id
  const body = _.pick(req.body, ['text', 'completed'])

  if (!ObjectId.isValid(id)) {
    return res.status(404).send()
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Todo.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    {
      $set: body
    },
    { new: true }
  )
    .then(todo => {
      if (!todo) {
        return res.status(404).send()
      }
      res.send({ todo })
    })
    .catch(err => {
      res.status(404).send()
    })
})

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  const user = new User(body)

  user
    .save()
    .then(() => {
      // generate user token from custom user schema method
      return user.generateAuthToken()
    })
    .then(token => {
      // set header to returned auth token, send user
      res.header('x-auth', token).send(user)
    })
    .catch(error => {
      res.status(400).send(error)
    })
})

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password'])
    const user = await User.findByCredentials(body.email, body.password)
    const token = await user.generateAuthToken()
    res.header('x-auth', token).send(user)
    
  } catch (err) {
    
    res.status(400).send(err)
  }
})

app.delete('/users/me/token', authenticate, catchErrors(async (req, res) => {
  await req.user.removeToken(req.token)
  res.status(200).send()
  // res.status(400).send()
}))



app.listen(port, () => {
  console.log(`env=${env}. Server running on port ${port}`)
})

module.exports = { app }
