const express = require('express');
const {nanoid} = require('nanoid');

const Course = require('../models/Course');
const auth = require("../middleweare/auth");
const permit = require("../middleweare/permit");

const router = express.Router();

router.get('/', async(req, res) => {
    const sort = {};
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

// router.post('/',)
module.exports = router;
