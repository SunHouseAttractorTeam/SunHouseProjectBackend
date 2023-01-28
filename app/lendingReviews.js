const express = require('express')
const upload = require('../middleweare/upload')
const permit = require('../middleweare/permit')
const auth = require('../middleweare/auth')
const Review = require('../models/LendingReview')
const { deleteFile } = require('../middleweare/clearArrayFromFiles')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const review = await Review.find()
    return res.send(review)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.post('/', auth, permit('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, socialNetwork, description } = req.body
    if (!name || !socialNetwork || !description) {
      return res.status(400).send({
        message: 'Введенные данные не верны!',
      })
    }
    const reviewData = {
      name,
      description,
      socialNetwork,
      image: null,
    }
    if (req.file) {
      reviewData.image = req.file.filename
    }

    const review = new Review(reviewData)
    await review.save()
    return res.send(review)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.delete('/:id', auth, permit('admin'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).send({ message: 'Review not found!' })
    }

    const deleteReview = await Review.findByIdAndDelete({ _id: req.params.id })

    if (deleteReview.image) {
      deleteFile(deleteReview.image)
    }

    return res.send(deleteReview)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
