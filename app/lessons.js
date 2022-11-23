const express = require('express')
const auth = require("../middleweare/auth");
const Lesson = require("../models/Lesson");
const permit = require("../middleweare/permit");

const router = express.Router()

router.get('/', auth, async (req, res) => {
    try {
        const lesson = await Lesson.find()
        return res.send(lesson)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

router.get('/:id', auth, async (req, res) => {
    try {
        const findLesson = await Lesson.findById(req.params.id)

        if (!findLesson) {
            return res.status(404).send({ message: 'Lesson not found!' })
        }

        return res.send(findLesson)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }

})

router.post('/', auth, permit('admin', 'teacher'),   async (req, res) => {
    try {
        const {title, description,file, audio, video, module} = req.body

        if (!title && !description && !module ) {
            return res.status(400).send({
                message: 'Data not valid',
            })
        }

        if(!audio && !video && !file){
            return res.status(400).send({
                message: 'Provide file,audio or video',
            })
        }

        const lessonData = {
            title,
            description
        }
        if (audio) lessonData.audio = audio
        if (video) lessonData.video = video
        if (file) lessonData.file = file

        const lesson = new Lesson(lessonData)
        await lesson.save()

        // TODO: need to wait SUN-70 task for use model Module
        // Need to save lesson model to the Module.data

        return res.send(lesson)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

router.put('/:id',auth, async (req, res) => {
    try {
        const {title, description,file, audio, video } = req.body

        if (!title && !description) {
            return res.status(400).send({
                message: 'Data not valid',
            })
        }

        if(!audio && !video && !file){
            return res.status(400).send({
                message: 'Provide file,audio or video',
            })
        }

        const lessonData = {
            title,
            description,
            file,
            audio,
            video
        }

        const lesson = await Lesson.findById(req.params.id)

        if (!lesson) {
            return res.status(404).send({ message: 'Lesson not found!' })
        }

        const updateLesson = await Lesson.findByIdAndUpdate(req.params.id, lessonData, { new: true })

        // TODO: need to wait SUN-70 task for use model Module
        // Need to update lesson model in the Module.data array

        return res.send(updateLesson)
    } catch (e) {
        return  res.status(500).send({ error: e.message })
    }
})

router.delete('/:id' ,auth,  permit('admin', 'teacher'), async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)

        if (!lesson) {
            return res.status(404).send({ message: 'Lesson not found!' })
        }

        const deleteLesson = await Lesson.findByIdAndDelete({ _id: req.params.id })

        // TODO: need to wait SUN-70 task for use model Module
        // Need to delete lesson model from Module.data array

        return res.send(deleteLesson)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

module.exports = router
