const {ObjectId} = require('mongodb')
const {mongoose} = require('./../server/db/mongoose')
const {Todo} = require('./../server/models/todo')
const {User} = require('./../server/models/user')

var id = '598500f3fc7f667450e14ffd33'

if (!ObjectId.isValid(id)) {
  console.log('id not valid')
}

// Todo.find({
//   _id: id
// }).then(todos => {
//   console.log('Todos', todos)
// })
// .catch(err => {
//   throw Error(err)
// })

// Todo.findOne({
//   _id: id
// }).then(todo => {
//   console.log('Todo', todo)
// })
// .catch(err => {
//   throw Error(err)
// })

Todo.findById(id).then(todo => {
  if (!todo) {
    return console.log('id not found')
  }
  console.log(todo)
})
.catch(err => {
  console.log(err)
})