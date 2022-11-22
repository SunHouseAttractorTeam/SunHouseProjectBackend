const express = require('express')
const router = express.Router()
const dayjs = require("dayjs");

const Module = require('../models/Module')


const auth = require("../middleweare/auth")
const permit = require("../middleweare/permit")

router.get('/', auth, permit('admin', 'teacher'), async (req, res) => {
    try {

        const modules = await Module.find()

        res.send(modules)
    } catch (e) {
        return res.status(500).send({error: e.message})
    }
})

router.get('/:id', auth, permit('admin', 'teacher'), async (req, res) => {
    try {

        const {id} = req.params

        const modules = await Module.findById(id)

        res.send(modules)
    } catch (e) {
        return res.status(500).send({error: e.message})
    }
})

router.post('/', auth, permit('admin', 'teacher'), async (req, res) => {
    try {
        const {title, course} = req.body
        if (!title || !course) {
            return res.status(400).send({error: 'Data not valid'})
        }

        const modulesData = {
            title,
            course,
            datetime: dayjs().format('DD/MM/YYYY'),
        }

        const modules = new Module(modulesData)
        await modules.save()

        res.send(modules)
    } catch (e) {
        return res.status(500).send({error: e.message})
    }
})

router.put('/:id', auth, permit('admin', 'teacher'), async (req, res) => {
    try {
        const {id} = req.params
        const {title} = req.body

        const modules = await Module.findById(id)

        if (!modules) {
            return res.status(400).send({message: 'Module not found'})
        }

        modules.title = title

        modules.save()
        res.send(modules)
    } catch (e) {
        return res.status(500).send({error: e.message})
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const modules = await Module.findById(id)

        if (!modules) {
            return res.status(401).send({message: 'Not found'})
        }

        await Module.deleteOne(modules)

        res.send({message: 'Success'})
    } catch (e) {
        return res.status(500).send({error: e.message})
    }

})


module.exports = router;