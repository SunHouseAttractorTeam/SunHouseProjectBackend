require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const exitHook = require('async-exit-hook')
const cookieParser = require('cookie-parser')
const config = require('./config')

const categories = require('./app/categories')
const courses = require('./app/courses')
const users = require('./app/users')
const notifications = require('./app/notifications')
const tasks = require('./app/tasks')
const lessons = require('./app/lessons')
const tests = require('./app/tests')
const modules = require('./app/modules')
const lendingReviews = require('./app/lendingReviews')
const lendingTeachers = require('./app/lendingTeachers')

const app = express()
const port = 8000

app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: ['http://localhost:3000'],
  }),
)

app.use('/categories', categories)
app.use('/courses', courses)
app.use('/users', users)
app.use('/notifications', notifications)
app.use('/lessons', lessons)
app.use('/tasks', tasks)
app.use('/tests', tests)
app.use('/modules', modules)
app.use('/lending_reviews', lendingReviews)
app.use('/lending_teachers', lendingTeachers)

const run = async () => {
  await mongoose.connect(config.mongo.db, config.mongo.options)
  console.log('Mongo connected')
  app.listen(port, () => {
    console.log(`Server started on ${port} port!`)
  })

  exitHook(() => {
    mongoose.disconnect()
    console.log('MongoDb disconnect')
  })
}

run().catch(e => console.error(e))
