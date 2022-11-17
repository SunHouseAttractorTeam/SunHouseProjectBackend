const express = require('express')
const Notification = require('../models/Notification')
const permit = require("../middleweare/permit")
const auth = require("../middleweare/auth");

const router = express.Router()

router.get('/', auth, async (req, res) => {
    try {
        const notification = await Notification.find()
        res.send(notification)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

router.get('/:id', auth, async (req, res) => {
    try {
        const findNotifications = await Notification.findById(req.params.id)

        if (!findNotifications) {
            return res.status(404).send({ message: 'Notifications not found!' })
        }

        res.send(findNotifications)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

router.post('/', auth, permit('admin', 'teacher'), async (req, res) => {
    try {
        const {type, description } = req.body

        if (!type && !description) {
            return res.status(400).send({
                message: 'Data not valid',
            })
        }

        const notificationData = {
            type,
            description,
            user:req.user._id
        }

        const notification = new Notification(notificationData)
        await notification.save()
        res.send(notification)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

router.put('/:id',auth, permit('admin', 'teacher'), async (req, res) => {
    try {
        const {type, description } = req.body

        if (!type && !description) {
            return res.status(400).send({
                message: 'Data not valid',
            })
        }

        const notificationData = {
            type,
            description,
            user:req.user._id
        }

        const notification = await Notification.findById(req.params.id)

        if (!notification) {
            return res.status(404).send({ message: 'Notification not found!' })
        }

        const updateNotification = await Notification.findByIdAndUpdate(req.params.id, notificationData, { new: true })
        res.send(updateNotification)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

router.delete('/:id',auth,  permit('admin', 'teacher'), async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id)

        if (!notification) {
            return res.status(404).send({ message: 'Notification not found!' })
        }

        const deleteNotification = await Notification.findByIdAndDelete({ _id: req.params.id })

        res.send(deleteNotification)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

module.exports = router