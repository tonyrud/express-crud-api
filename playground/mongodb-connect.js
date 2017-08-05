// const MongoClient = require('mongodb').MongoClient
const { MongoClient, ObjectID } = require('mongodb')

let obj = new ObjectID()
console.log()

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('unable to connect to mongodb')
  }
  console.log('Connected to Mongodb on localhost')

  // db.collection('Todos').insertOne({
  //   text: 'A todo',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('unable to insert todo', err)
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2))
  // })
  db.collection('Users').insertOne({
    name: 'Tony',
    age: 34,
    location: 'Fort Wayne'
  }, (err, result) => {
    if (err) {
      return console.log('unable to insert todo', err)
    }
    console.log(JSON.stringify(result.ops, undefined, 2))
  })

  db.close()
})
