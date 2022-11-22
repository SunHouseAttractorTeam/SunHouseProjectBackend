const mongoose = require('mongoose')
const { Schema } = mongoose

const AnswerSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    }
})

const QuestionSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    answers: [AnswerSchema]
})


const TestSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    },
    questions: [QuestionSchema],
    file: String,
    video: String,
    audio: String,
});

const Test = mongoose.model('Test', TestSchema)
module.exports = Test