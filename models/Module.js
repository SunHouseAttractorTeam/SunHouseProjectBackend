const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ModuleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    datetime:{
        type: String,
        required: true,
    },
    data:[]
})

const Module = mongoose.model('Module',ModuleSchema)

module.exports = Module