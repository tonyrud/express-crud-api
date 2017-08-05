const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('unable to connect to mongodb')
  }
  console.log('Connected to Mongodb on localhost')

  db.collection('Todos').find({completed: true}).toArray().then(
    results => {
      console.log('Todos:')
      console.log(JSON.stringify(results, undefined, 6))
    },
    err => {
      console.log('error fetching todos', err)
    }
  )

  // db.close()
})
