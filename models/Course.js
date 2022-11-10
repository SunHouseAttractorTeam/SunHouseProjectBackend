const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const  CourseSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    educationProgram: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EducationProgram',
    }],
    // rating: [{
    //     user: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'User'
    //     },
    //     value: {
    //         type: Number,
    //         min: 0,
    //         max: 5,
    //     },
    // }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    time: {
        type: String,
        required: true,
    },
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;