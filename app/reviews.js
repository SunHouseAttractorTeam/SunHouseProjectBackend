const express = require('express')
const Review = require("../models/Review");
const auth = require("../middleweare/auth");
const permit = require("../middleweare/permit");

const router = express.Router()

router.get('/',  async (req, res) => {
    try {
        const review = await Review.find()
        return res.send(review)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const findReview = await Review.findById(req.params.id)

        if (!findReview) {
            return res.status(404).send({ message: 'Review not found!' })
        }

        return res.send(findReview)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

router.post('/', auth, async (req, res) => {
    try {
        const {text, socialNetwork} = req.body

        if (!text || !socialNetwork) {
            return res.status(400).send({
                message: 'Data not valid',
            })
        }

        const reviewData = {
            text,
            user: req.user._id,
            socialNetwork
        }

        const review = new Review(reviewData)
        await review.save()
        return res.send(review)
    } catch (e) {
        return  res.status(500).send({ error: e.message })
    }
})

router.put('/:id',  permit('admin', 'user'), auth, async (req, res) => {
    try {
        const { text, socialNetwork } = req.body

        if (!text || !socialNetwork ) {
            return res.status(400).send({ error: 'Data not valid' })
        }

        const reviewData = {
            text,
            user: req.user._id,
            socialNetwork
        }

        const review = await Review.findById(req.params.id)

        if (!review) {
            return res.status(404).send({ message: 'Review not found!' })
        }

        const updateReview = await Review.findByIdAndUpdate(req.params.id, reviewData, { new: true })
        return  res.send(updateReview)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

router.delete('/:id',  permit('admin'), auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)

        if (!review) {
            return res.status(404).send({ message: 'Review not found!' })
        }

        const deleteReview = await Review.findByIdAndDelete({ _id: req.params.id })

        return  res.send(deleteReview)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

module.exports = router

