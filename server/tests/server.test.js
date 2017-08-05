const expect = require('expect')
const request = require('supertest')
const {ObjectId} = require('mongodb')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')

const todos = [
  {
    _id: new ObjectId(),
    text: 'first test todo'
  },
  {
    _id: new ObjectId(),
    text: 'Second test todo'
  }
]

beforeEach(done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done())
})

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Test todo text'

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({text})
          .then(todos => {
            expect(todos.length).toBe(1)
            expect(todos[0].text).toBe(text)
            done()
          })
          .catch(error => done(error))
      })
  })

  it('should not create todo with invalid data body', done => {
    request(app).post('/todos').send({}).expect(400).end((err, res) => {
      if (err) {
        return done(err)
      }

      Todo.find()
        .then(todos => {
          expect(todos.length).toBe(2)
          done()
        })
        .catch(error => done(error))
    })
  })
})

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return a 404 if todo not found', (done) => {
    const fakeId = new ObjectId()
    request(app)
      .get(`/todos/${fakeId.toHexString()}`)
      .expect(404)
      .end(done)
  })

  it('should return a 404 for an incorrect object id', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done)
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = todos[1]._id.toHexString()
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.findById(hexId).then(todo => {
          expect(todo).toNotExist()
          done()
        })
        .catch(err => done(err))
      })
  })

  it('it should return 404 if todo not found', (done) => {
    const fakeId = new ObjectId()
    request(app)
      .delete(`/todos/${fakeId.toHexString()}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 if object id not correct', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done)
  })
})