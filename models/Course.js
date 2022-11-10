const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const  CourseSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    // favorites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    rating: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        value: {
            type: Number,
            min: 0,
            max: 5,
        },
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    tests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
    }],

    //if test will be uploads

    // tests: [{
    //     type: String,
    // }],

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


///////// нужно ли делать привязку студентов к курсу? так же преподавателя - это сам юзер, который владеет самим курсом?


CourseSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique'});
const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;