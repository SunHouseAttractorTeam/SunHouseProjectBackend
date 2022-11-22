const express = require('express')

const Test = require('../models/Test ')
const Module = require('../models/Module')
const auth = require('../middleweare/auth')
const permit = require('../middleweare/permit')

const router = express.Router()

router.get('/', auth, async (req, res) => {
    const query = {}

    if(req.query.module) query.module = req.query.module

    try {
        const tests = await Test.find(query)

        return res.send(tests)
    } catch (e) {
        return res.sendStatus(500);
    }
})

router.get('/:id', auth, async( req, res) => {
    try {
        const test = await Test.findById(req.params.id)

        if(!test) return res.status(404).send('Test no found')

        return res.send(test)
    } catch (e) {
        return res.sendStatus(500);
    }
})

router.post('/', permit('teacher'), async (req, res) => {
    try {
        const { title, description, module, questions} = req.body

        if (!title || !description || !module || !questions) {
            return res.status(401).send('Data not valid')
        }

        const testData = {
            title,
            description,
            module,
            questions,
            file: null,
            video: null,
            audio: null,
        }

        if(req.file) {
            switch (req.file.type) {
                case 'file':
                    return testData.file = req.file.file
                case 'video':
                   return  testData.video = req.file.file
                case 'audio':
                   return  testData.audio = req.file.file
                default:
                    return  testData
            }
        }

        const test = new Test(testData)
        await test.save()

        await Module.data.push(test);
        await Module.save()

        return res.send(test)

    } catch (e) {
        return res.sendStatus(500)
    }
})

router.put('/:id', auth, permit('teacher', 'admin'), async (req, res) => {
    const {title, description, questions, module } = req.body

    if (!title || !description || !module || !questions) {
        return res.status(401).send('Data not valid')
    }

    const testData = {
        title,
        description,
        module,
        questions,
        file: null,
        video: null,
        audio: null,
    }

    if(req.file) {
        switch (req.file.type) {
            case 'file':
                return testData.file = req.file.file
            case 'video':
                return  testData.video = req.file.file
            case 'audio':
                return  testData.audio = req.file.file
            default:
                return  testData
        }
    }

    try {
        const test = await Test.findById(req.params.id)

        if(!test) return res.status(404).send('Test not found')
            //привязать и проверить что тест принадлежит нужному пользователю

        const updateTest = await Test.findByIdAndUpdate(req.params.id, testData)

        //найти в массиве обьект и заменить его.
         Module.data.map( item => {
             if(updateTest._id === item._id) return updateTest
             else if(item) return item
        })
        Module.save()

        return res.send(updateTest)
    } catch (e) {
        return res.sendStatus(500);
    }
})

router.delete('/:id', auth, permit('teacher', 'admin'), async( req, res) => {
    try {

        const test = await Test.findById(req.params.id)

        //нужно привязать тест к юзеру, чтобы можно было удалять только свои тесты

        if(!test) {
            return res.status(404).send('Test not found')
        }

        const response = await Test.deleteOne({ _id: req.params.id })

        if (response.deletedCount) {
            return res.send('Success')
        }

        return res.status(403).send({ error: 'Deleted failed' })
    } catch(e) {
        return res.sendStatus(500);
    }
})

module.exports = router