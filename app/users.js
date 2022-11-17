const express = require('express')
const axios = require('axios')
const { nanoid } = require('nanoid')
const { VKAPI } = require('vkontakte-api')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const config = require('../config')

const client = new OAuth2Client(config.google.clientId)
const router = express.Router()
const utils = require('../middleweare/token')

router.post('/', async (req, res) => {
  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      return res.status(400).send({ error: 'Data not valid' })
    }

    const maxAge = 72 * 60 * 60
    const token = utils.getToken(username, maxAge)

    const userData = { email, password, username, token }

    const user = new User(userData)

    res.cookie('jwt', token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
    })

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

    const { username } = user
    const maxAge = 72 * 60 * 60
    const token = utils.getToken(username, maxAge)

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
      console.log(req.body.userID, response.data.data.user_id)
      return res.status(401).send({ message: 'Wrong User ID' })
    }

    let user = await User.findOne({ facebookId: req.body.id })

    const { username } = user
    const maxAge = 2 * 60 * 60
    const token = utils.getToken(username, maxAge)

    if (!user) {
      user = new User({
        email: req.body.email,
        password: nanoid(),
        facebookId: req.body.id,
        username: req.body.name,
        avatar: req.body.picture.data.url,
      })
    }

    await user.save({ validateBeforeSave: false })
    user.token = token
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

    let userIs = await User.findOne({ vkId: user.id })
    if (!userIs) {
      userIs = new User({
        email: `${user.id}@gmail.com`,
        password: nanoid(),
        vkId: user.id,
        username: `${user.first_name} ${user.last_name}`,
        avatar: ticket[0].photo_max_orig,
      })
    }

    const maxAge = 2 * 60 * 60
    const token = utils.getToken(userIs.username, maxAge)

    await userIs.save({ validateBeforeSave: false })
    userIs.token = token

    return res.send(userIs)
  } catch (e) {
    return res.status(401).send({ message: 'VK token incorrect!' })
  }
})

router.post('/googleLogin', async (req, res) => {
  const token = req.body.credential

  try {
    const ticket = await client.verifyIdToken({
      idToken: `${token}`,
      audience: config.google.clientId,
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
      })
    }

    await user.save({ validateBeforeSave: false })
    user.token = token

    return res.send(user)
  } catch (e) {
    return res.status(401).send({ message: 'Google token incorrect!' })
  }
})

router.delete('/sessions', async (req, res) => {
  const success = { message: 'Success' }
  const cookie = req.cookies.jwt

  if (!cookie) return res.send(success)

  const user = await User.findOne({ token: cookie })

  if (!user) return res.send(success)
  const maxAge = 2 * 60 * 60

  user.token = utils.getToken(user.username, maxAge)
  await user.save({ validateBeforeSave: false })

  return res.send({ success, user })
})

module.exports = router
