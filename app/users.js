const express = require('express')
const axios = require('axios')
const { nanoid } = require('nanoid')
const { VKAPI } = require('vkontakte-api')
const { OAuth2Client, auth} = require('google-auth-library')
const User = require('../models/User')
const config = require('../config')

const client = new OAuth2Client(config.google.clientId)
const router = express.Router()
const utils = require('../middleweare/token')
const permit = require("../middleweare/permit");

const getLiveCookie = user => {
  const { username } = user
  const maxAge = 730 * 60 * 60
  return { token: utils.getToken(username, maxAge), maxAge }
}

router.post('/', async (req, res) => {
  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      return res.status(400).send({ error: 'Data not valid' })
    }

    const userData = { email, password, username }

    const user = new User(userData)

    const { token, maxAge } = getLiveCookie(user)

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

    user.token = token

    await user.save()

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
    accessToken: config.vk.personalToken,
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

    // Временный набросок счетчика //
router.put('/?test=testId/:id',permit('Teacher'),async (req, res) => {
  const idUser = req.params.id
  const idTest = req.query.test
  try {
  const user = await User.findById(idUser)
  const test = await User.find({count: {$elemMatch: {test: idTest}}})
    // Нужна проверка на число в счетчике
  if (!user) {
    return res.status(404).send({ message: 'User not found!' })
  }
  if (!test) {
    return res.status(404).send({ message: 'Test not found!' })
  }
    // Нужно ли дополнительно искать тест?
  const updateCount =  await User.findByIdAndUpdate(idUser, {$push: {count: count++}})
    return res.send(updateCount)
  } catch (e) {
    return res.sendStatus(500)
  }
})
      // Временный набросок обнуления счетчика
router.delete('/?test=testId/:id',permit('Teacher'),async (req, res) => {
  const idUser = req.params.id
  const idTest = req.query.test
  try {
    const user = await User.findById(idUser)
    const test = await User.find({count: {$elemMatch: {test: idTest}}})
    if (!user) {
      return res.status(404).send({ message: 'User not found!' })
    }
    if (!test) {
      return res.status(404).send({ message: 'Test not found!' })
    }
    // Нужно ли дополнительно искать тест?
    const updateCount =  await User.findByIdAndUpdate(idUser, {$push: {count: 0}})
    return res.send(updateCount)
  } catch (e) {
    return res.sendStatus(500)
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
