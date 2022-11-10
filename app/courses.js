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

module.exports = router;
