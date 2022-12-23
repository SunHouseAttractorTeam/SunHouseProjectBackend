const express = require('express')
const axios = require('axios')
const { nanoid } = require('nanoid')
const { VKAPI } = require('vkontakte-api')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const config = require('../config')
const nodemailer = require('./nodemailer')

const client = new OAuth2Client()
const router = express.Router()
const utils = require('../middleweare/token')
const auth = require('../middleweare/auth')
const Course = require('../models/Course')
const Test = require('../models/Test')
const Lesson = require('../models/Lesson')
const Task = require('../models/Task')

const getLiveCookie = user => {
  const { username } = user
  const maxAge = 730 * 60 * 60
  return { token: utils.getToken(username, maxAge), maxAge }
}

const getLiveSecretCookie = user => {
  const { username } = user
  const maxAge = 5 * 60 * 60
  return { token: utils.getToken(username, maxAge), maxAge }
}

router.get('/', async (req, res) => {
  try {
    const users = await User.find()
    return res.send(users)
  } catch (e) {
    return res.status(500)
  }
})

router.get('/confirm/:confirmationCode', async (req, res) => {
  try {
    const user = await User.findOne({ confirmationCode: req.params.confirmationCode })
    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }
    user.authentication = true
    await user.save({ validateBeforeSave: false })
    console.log(user)
    return res.send({ message: 'Account confirm' })
  } catch (e) {
    return res.status(500).send({ message: e })
  }
})

router.post('/', async (req, res) => {
  try {
    const secretToken = getLiveSecretCookie({ email: req.body.email })
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      return res.status(400).send({ error: 'Data not valid' })
    }

    const userData = { email, password, username, confirmationCode: secretToken.token }

    const user = new User(userData)

    const { token, maxAge } = getLiveCookie(user)

    // res.cookie('jwt', token, {
    //     httpOnly: false,
    //     maxAge: maxAge * 1000,
    // })

    user.token = token

    await user.save()

    nodemailer.sendConfirmationCode(user.username, user.email, user.confirmationCode)

    return res.status(201).send(user)
  } catch (e) {
    return res.status(400).send(e)
  }
})

router.post('/sessions', async (req, res) => {
  try {
    if (req.cookies.jwt) {
      const user = await User.findOne({ token: req.cookies.jwt })
      return res.send(user)
    }

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(401).send({ error: 'Credentials are wrong!' })
    }

    if (user.authentication !== true) {
      return res.status(401).send({ message: 'Pending account. Please verify your email' })
    }

    const isMatch = await user.checkPassword(req.body.password)
    if (!isMatch) {
      res.status(401).send({ error: 'Credentials are wrong!' })
    }

    const { token, maxAge } = getLiveCookie(user)

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

    user.token = token
    await user.save({ validateBeforeSave: false })

    return res.send(user)
  } catch (e) {
    return res.status(500)
  }
})

router.post('/facebookLogin', async (req, res) => {
  const inputToken = req.body.accessToken
  const accessToken = `${config.facebook.appId}|${config.facebook.appSecret}`

  const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${inputToken}&access_token=${accessToken}`

  try {
    const response = await axios.get(debugTokenUrl)

    if (response.data.data.error) {
      return res.status(401).send({ message: 'Facebook token incorrect!' })
    }

    if (req.body.userID !== response.data.data.user_id) {
      return res.status(401).send({ message: 'Wrong User ID' })
    }
    let user = await User.findOne({ $or: [{ facebookId: req.body.userID }, { email: req.body.email }] })

    if (!user) {
      user = new User({
        email: req.body.email,
        password: nanoid(),
        facebookId: req.body.userID,
        username: req.body.name,
        avatar: req.body.picture.data.url,
        authentication: true,
      })
    }
    const { token, maxAge } = getLiveCookie(user)
    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

    user.token = token

    await user.save({ validateBeforeSave: false })
    return res.send(user)
  } catch (e) {
    return res.status(401).send({ message: 'Facebook token incorrect!' })
  }
})

router.post('/vkLogin', async (req, res) => {
  const api = new VKAPI({
    accessToken: req.body.session.sid,
  })

  try {
    const { user } = req.body.session
    const ticket = await api.users.get({ user_ids: [user.id], fields: ['photo_max_orig'] })

    if (ticket.length === 0 || ticket[0].id !== parseInt(user.id, 10)) {
      return res.status(401).send({ message: 'VK token incorrect!' })
    }

    let userIs = await User.findOne({ $or: [{ vkId: user.id }, { email: req.body.email }] })

    if (!userIs) {
      userIs = new User({
        email: `${user.id}@gmail.com`,
        password: nanoid(),
        vkId: user.id,
        username: `${user.first_name} ${user.last_name}`,
        avatar: ticket[0].photo_max_orig,
        authentication: true,
      })
    }

    const { token, maxAge } = getLiveCookie(user)

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

    userIs.token = token
    await userIs.save({ validateBeforeSave: false })

    return res.send(userIs)
  } catch (e) {
    return res.status(401).send({ message: 'VK token incorrect!' })
  }
})

router.post('/googleLogin', async (req, res) => {
  const { credential, clientId } = req.body
  try {
    const ticket = await client.verifyIdToken({
      idToken: `${credential}`,
      audience: clientId,
    })

    const { name, email, picture, sub } = ticket.payload

    let user = await User.findOne({ email })

    if (!user) {
      user = new User({
        email,
        password: nanoid(),
        username: name,
        avatar: picture,
        googleId: sub,
        authentication: true,
      })
    }

    const { token, maxAge } = getLiveCookie(user)

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

    user.token = token
    await user.save({ validateBeforeSave: false })
    return res.send(user)
  } catch (e) {
    return res.status(401).send({ message: 'Google token incorrect!' })
  }
})

// Добавление таска

router.put('/add_task', auth, async (req, res) => {
  const userId = req.user._id
  const taskId = req.query.task
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ message: 'User not found!' })
    }
    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).send({ message: 'Task not found!' })
    }
    const addTask = await User.findByIdAndUpdate(user, { $push: { tasks: { task } } })
    return res.send(addTask)
  } catch (e) {
    return res.status(500)
  }
})

// Добавление урока со статусом

router.put('/add_lesson', auth, async (req, res) => {
  const userId = req.user._id
  const lessonId = req.query.lesson
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ message: 'User not found!' })
    }
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return res.status(404).send({ message: 'Lesson not found!' })
    }
    const addLesson = await User.findByIdAndUpdate(user, { $push: { lessons: { lesson } } })
    return res.send(addLesson)
  } catch (e) {
    return res.status(500)
  }
})

// Добавление теста c счетчиком и статусом

router.put('/add_test', auth, async (req, res) => {
  const userId = req.user._id
  const testId = req.query.test
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ message: 'User not found!' })
    }
    const test = await Test.findById(testId)
    if (!test) {
      return res.status(404).send({ message: 'Test not found!' })
    }
    const addTest = await User.findByIdAndUpdate(user, { $push: { tests: { test } } })
    return res.send(addTest)
  } catch (e) {
    return res.status(500)
  }
})

// Добавление курса со статусом
router.put('/add_course', auth, async (req, res) => {
  const courseId = req.query.course
  const userId = req.user
  try {
    const user = await User.findById(userId)
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).send({ message: 'Course not found!' })
    }
    if (!user) {
      return res.status(404).send({ message: 'User not found!' })
    }
    const addCourse = await User.findByIdAndUpdate(user, { $push: { myCourses: { course } } })
    return res.send(addCourse)
  } catch (e) {
    return res.status(500)
  }
})

// Изменение статуса

router.post('/:id/update_status', auth, async (req, res) => {
  const { id } = req.params
  const userId = req.query.userid
  try {
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).send({ message: 'User not found!' })
    }
    switch (req.query.params) {
      case 'course': {
        const course = await Course.findById(id)
        if (!course) {
          return res.status(404).send({ message: 'Course not found!' })
        }
        await User.update(
          {
            _id: userId,
            'myCourse.course': id,
          },
          { $set: { 'myCourses.$.status': false } },
        )
        return res.send(user)
      }
      case 'test': {
        const test = await Test.findById(id)
        if (!test) {
          return res.status(404).send({ message: 'Test not found!' })
        }
        await User.update(
          {
            _id: userId,
            'tests.test': id,
          },
          { $set: { 'tests.$.status': false } },
        )
        return res.send(user)
      }
      case 'lesson': {
        const lesson = await Lesson.findById(id)
        if (!lesson) {
          return res.status(404).send({ message: 'Lesson not found!' })
        }
        await User.update(
          {
            _id: userId,
            'lessons.lesson': id,
          },
          { $set: { 'lessons.$.status': false } },
        )
        return res.send(user)
      }
      case 'task': {
        const task = await Task.findById(id)
        if (!task) {
          return res.status(404).send({ message: 'Task not found!' })
        }
        if (user.role === 'teacher') {
          await User.update(
            {
              _id: userId,
              'tasks.task': id,
            },
            { $set: { 'tasks.$.status': false } },
          )
        }
        return res.send(user)
      }
      default:
        return res.send(user)
    }
  } catch (e) {
    return res.status(500)
  }
})

router.delete('/sessions', async (req, res) => {
  const success = { message: 'Success' }
  const cookie = req.cookies.jwt

  if (!cookie) return res.send(success)

  const user = await User.findOne({ token: cookie })

  if (!user) return res.send(success)

  const { token } = getLiveCookie(user)
  user.token = token

  await user.save({ validateBeforeSave: false })

  return res.send({ success, user })
})

module.exports = router
