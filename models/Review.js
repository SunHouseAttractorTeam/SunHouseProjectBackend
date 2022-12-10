const mongoose = require('mongoose')

const { Schema } = mongoose

const ReviewSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    text: {
        type: String,
        required: true
    },
    socialNetwork: {
        type: String,
        required: true
    }
})

const Review = mongoose.model('Review', ReviewSchema)

module.exports = Review