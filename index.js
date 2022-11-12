const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const exitHook = require('async-exit-hook')
const config = require('./config')

const categories = require('./app/categories')
const courses = require('./app/courses')

const app = express()
const port = 8000

app.use(express.static('public'))
app.use(express.json())
app.use(cors())

app.use('/categories', categories)
app.use('/courses', courses)

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
