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


module.exports = router;
