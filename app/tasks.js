const express = require('express')
const auth = require("../middleweare/auth");
const Task = require("../models/Task");
const permit = require("../middleweare/permit");

const router = express.Router()

router.get('/', auth, async (req, res) => {
    try {
        const task = await Task.find()
        return res.send(task)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

router.get('/:id', auth, async (req, res) => {
    try {
        const findTask = await Task.findById(req.params.id)

        if (!findTask) {
            return res.status(404).send({ message: 'Task not found!' })
        }

        return res.send(findTask)
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

        const taskData = {
            title,
            description
        }
        if (audio) taskData.audio = audio
        if (video) taskData.video = video
        if (file) taskData.file = file

        const task = new Task(taskData)
        await task.save()

        // TODO: need to wait SUN-70 task for use model Module
        // Need to save task model to the Module.data

        return res.send(task)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

router.put('/:id',auth, permit('admin', 'teacher'), async (req, res) => {
    try {
        const {title, description,file, audio, video, module } = req.body

        if (!title && !description && !module) {
            return res.status(400).send({
                message: 'Data not valid',
            })
        }

        if(!audio && !video && !file){
            return res.status(400).send({
                message: 'Provide file,audio or video',
            })
        }

        const taskData = {
            title,
            description,
            file,
            audio,
            video
        }

        const task = await Task.findById(req.params.id)

        if (!task) {
            return res.status(404).send({ message: 'Task not found!' })
        }

        const updateTask = await Task.findByIdAndUpdate(req.params.id, taskData, { new: true })

        // TODO: need to wait SUN-70 task for use model Module
        // Need to update task model in the Module.data array

        return res.send(updateTask)
    } catch (e) {
        return  res.status(500).send({ error: e.message })
    }
})

router.delete('/:id' ,auth,  permit('admin', 'teacher'), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)

        if (!task) {
            return res.status(404).send({ message: 'Task not found!' })
        }

        const deleteTask = await Task.findByIdAndDelete({ _id: req.params.id })

        // TODO: need to wait SUN-70 task for use model Module
        // Need to delete task model from Module.data array

        return res.send(deleteTask)
    } catch (e) {
        return res.status(500).send({ error: e.message })
    }
})

module.exports = router