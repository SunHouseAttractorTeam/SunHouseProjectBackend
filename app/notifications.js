const express = require('express')
const Notification = require('../models/Notification')
const permit = require('../middleweare/permit')
const auth = require('../middleweare/auth')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const query = {}

    if (req.query.user && !req.query.user) query.user = req.query.user
    const notification = await Notification.find()
    return res.send(notification)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const findNotifications = await Notification.findById(req.params.id)

    if (!findNotifications) {
      return res.status(404).send({ message: 'Notifications not found!' })
    }

    return res.send(findNotifications)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.post('/', auth, permit('admin'), async (req, res) => {
  try {
    const { user, description } = req.body
    if (!user || !description) {
      return res.status(400).send({
        message: 'Data not valid',
      })
    }

    const notificationData = {
      description,
      user,
    }

    const notification = new Notification(notificationData)
    await notification.save()
    return res.send(notification)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.put('/:id', auth, permit('admin'), async (req, res) => {
  try {
    const { type, description } = req.body

    if (!type && !description) {
      return res.status(400).send({
        message: 'Data not valid',
      })
    }

    const notificationData = {
      type,
      description,
      user: req.user._id,
    }

    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).send({ message: 'Notification not found!' })
    }

    const updateNotification = await Notification.findByIdAndUpdate(req.params.id, notificationData, { new: true })
    return res.send(updateNotification)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.delete('/:id', auth, permit('admin', 'user'), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).send({ message: 'Notification not found!' })
    }

    if (req.user._id.equals(notification.user)) {
      const deleteNotification = await Notification.findByIdAndDelete({ _id: req.params.id })
      return res.send(deleteNotification)
    }

    return res.status(403).send({ message: 'You not have any permission' })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
