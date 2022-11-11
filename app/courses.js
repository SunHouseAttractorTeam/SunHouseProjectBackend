const express = require('express');

const Course = require('../models/Course');
const auth = require("../middleweare/auth");
const permit = require("../middleweare/permit");

const router = express.Router();

router.get('/', async(req, res) => {
    const query = {};

    if(req.query.category) query.category = req.query.category;

    try {
        const courses = await Course
            .find(query)
            .sort()
            .populate('category', 'title')
            .populate('user', );

        res.send(courses);
    } catch (e) {
     res.sendStatus(500);
    }
});

router.get('/:id', async(req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            res.status(404).send({message: 'Course not found!'});
        }

        res.send(course);
    } catch (e) {
        res.sendStatus(500);
    }
});

router.post('/', auth, permit('teacher'), async (req, res) => {
    try {
        const { title, description, category, price, time } = req.body;

        if (!title || !description || !category || !price || !time) {
            return res.status(401).send({message: 'Data not valid!'});
        }

        const courseData = {
          title,
          description,
          user: req.user._id,
          category,
          price,
          time,
        };

        const course = new Course(courseData);
        await course.save();

        res.send(course);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.put('/:id', auth, permit('teacher'), async(req,  res) => {
    const { title, description, category, price, time } = req.body;
    const user = req.user;

    if (!title || !description || !category || !price || !time) {
        return res.status(401).send({message: 'Data not valid!'});
    }

    const courseData = {
        title,
        description,
        category,
        user: req.user._id,
        price,
        time,
    };

    try {
        const course = await Course.findById(req.params.id);

        if(!course) {
           return res.status(404).send({message: 'Course not found!'});
        }

        if(course.user._id !== user._id) {
            return res.status(401).send({message: 'Wrong token!'});
        }

        const updateCourse = await Course
            .findOneAndUpdate(req.params.id, courseData);

        res.send(updateCourse);
    }  catch (e) {
        res.sendStatus(500);
    }
});

router.delete('/:id', auth, permit('admin', 'teacher'), async(req, res) => {
    const courseId = req.params.id;

    try {
        const course = await Course.findById(courseId);

        if((course.user._id === req.user._id) || (req.user.role === 'admin')) {
            const response = await Course.deleteOne({_id: courseId});

            if( response['deletedCount']) {
                return res.send('Success');
            } else {
               return res.status(403).send({error: 'Deleted failed'});
            }
        }

        res.status(401).send({message: 'Wrong token!'});
    } catch (e) {
        res.sendStatus(500);
    }
});

module.exports = router;
