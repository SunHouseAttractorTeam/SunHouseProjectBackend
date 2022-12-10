const express = require('express')
const Review = require("../models/Review");
const auth = require("../middleweare/auth");

const router = express.Router()

router.get('/',  async (req, res) => {
    try {
        const review = await Review.find()
        res.send(review)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const findReview = await Review.findById(req.params.id)

        if (!findReview) {
            return res.status(404).send({ message: 'Review not found!' })
        }

        res.send(findReview)
    } catch (e) {
        res.status(500).send({ error: e.message })
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
        res.send(review)
    } catch (e) {
        console.log(e)
        res.status(500).send({ error: e.message })
    }
})

router.put('/:id', auth, async (req, res) => {
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
        res.send(updateReview)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

router.delete('/:id',  auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)

        if (!review) {
            return res.status(404).send({ message: 'Review not found!' })
        }

        const deleteReview = await Review.findByIdAndDelete({ _id: req.params.id })

        res.send(deleteReview)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

module.exports = router

