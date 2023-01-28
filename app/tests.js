const express = require('express')

const Test = require('../models/Test')
const Module = require('../models/Module')
const User = require('../models/User')
const auth = require('../middleweare/auth')
const permit = require('../middleweare/permit')
const searchAccesser = require('../middleweare/searchAccesser')
const upload = require('../middleweare/upload')
const { clearArrayFromFiles, deleteFile } = require('../middleweare/clearArrayFromFiles')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  const query = {}

  if (req.query.module) query.module = req.query.module

  try {
    const tests = await Test.find(query)

    return res.send(tests)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)

    if (!test) return res.status(404).send({ message: 'Такого теста нет!' })

    return res.send(test)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.post('/', auth, permit('admin', 'user'), async (req, res) => {
  const moduleId = req.query.module

  try {
    const module = await Module.findById(moduleId).populate('course', 'users')

    if (!module) {
      return res.status(404).send({ message: 'Такого модуля нет!!' })
    }

    const { title, random, correct } = req.body

    if (!title) {
      return res.status(401).send({ message: 'Введите название' })
    }

    const testData = {
      title,
      random,
      correct,
      module: moduleId,
    }

    const test = new Test(testData)
    await test.save()

    module.data.push({
      _id: test._id,
      type: test.type,
      title: test.title,
    })

    // eslint-disable-next-line no-restricted-syntax
    for (const id of module.course.users) {
      // eslint-disable-next-line no-await-in-loop
      await User.findByIdAndUpdate(id, { $push: { tests: { test } } })
    }

    await module.save()
    return res.send(test)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.put('/:id/questions', auth, searchAccesser, async (req, res) => {
  try {
    const questions = req.body

    const test = await Test.findById(req.params.id)

    if (!test) return res.status(404).send({ message: 'Такого теста нет!' })

    const updateTest = await Test.findByIdAndUpdate(req.params.id, { questions }, { new: true })

    return res.send(updateTest)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.put('/:id', auth, searchAccesser, upload.any(), async (req, res) => {
  try {
    const files = [...req.files]

    const parsedData = [...JSON.parse(req.body.payload)]
    const data = parsedData.map(item => {
      const keyName = Object.keys(item)[0]
      if (files.length) {
        if (keyName === files[0].fieldname) {
          item[keyName] = files[0].filename
          files.splice(0, 1)
        }
      }

      return item
    })

    const index = data.length - 1
    const lastFile = data[index]

    let isFile
    if (Object.keys(lastFile)[0] === 'file') {
      const { file } = data.splice(index, 1)[0]
      isFile = file
    }
    const { title } = data.splice(0, 1)[0]

    if (!title) {
      return res.status(401).send({ message: 'Введите название' })
    }

    const test = await Test.findById(req.params.id)

    if (!test) return res.status(404).send({ message: 'Такого теста нет!' })

    const updateTest = await Test.findByIdAndUpdate(
      req.params.id,
      {
        title,
        data,
        file: isFile,
      },
      { new: test },
    )

    if (test.title !== updateTest.title) {
      const module = await Module.findOne({ _id: test.module })

      if (!module) {
        return res.status(404).send({ message: 'Такого модуля нет!!' })
      }

      const itemToData = {
        _id: updateTest._id,
        type: updateTest.type,
        title: updateTest.title,
      }

      module.data = await Promise.all(
        module.data.map(item => {
          if (updateTest._id.toString() === item._id.toString()) return itemToData
          return item
        }),
      )

      await module.save()
    }

    if (test.file && test.file !== updateTest.file) {
      deleteFile(test.file)
    }

    if (test.data.length !== 0) {
      clearArrayFromFiles(test.data, updateTest.data)
    }

    return res.send(updateTest)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.patch('/:id', auth, async (req, res) => {
  try {
    const testId = req.params.id

    const test = await Test.findById(testId)

    if (!test) return res.status(404).send({ message: 'Такого теста нет!' })

    const answeredQuest = req.body.test
    const { user } = req

    if (answeredQuest && answeredQuest.length !== 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const userQuestion of answeredQuest) {
        // eslint-disable-next-line no-await-in-loop
        const obj = await Test.findOne({ _id: testId }, { questions: { $elemMatch: { _id: userQuestion.question } } })
        const { answers } = obj.questions[0]
        let answer
        answers.forEach(answerObj => {
          if (answerObj._id.equals(userQuestion.answer)) {
            answer = answerObj.status
          }
        })
        const savingUserAnswers = async () => {
          user.tests = await Promise.all(
            user.tests.map(testObj => {
              if (testObj.test.equals(testId)) {
                return testObj.answers.push({
                  questionId: userQuestion.question,
                  question: obj.questions[0].title,
                  status: answer,
                  answerId: userQuestion.answer,
                })
              }
              return testObj
            }),
          )
          await user.save({ validateBeforeSave: false })
        }

        if (answer === true) {
          // eslint-disable-next-line no-await-in-loop
          await savingUserAnswers()
        } else if (answer === false) {
          // eslint-disable-next-line no-await-in-loop
          await savingUserAnswers()
        }
      }
    }

    await user.save({ validateBeforeSave: false })

    return res.send(user)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.delete('/:id', auth, searchAccesser, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)

    if (!test) {
      return res.status(404).send({ message: 'Такого теста нет!' })
    }

    const response = await Test.deleteOne({ _id: req.params.id })

    if (response.deletedCount) {
      if (test.file) deleteFile(test.file)

      if (test.data && test.data.length !== 0) {
        test.data.forEach(obj => {
          if (obj.audio) deleteFile(obj.audio)
        })
      }

      const module = await Module.findById(test.module)

      if (!module) {
        return res.status(404).send({ message: 'Такого модуля нет!' })
      }

      module.data = module.data.filter(item => item._id.toString() !== test._id.toString())
      await module.save()

      return res.send({ message: 'Success' })
    }

    return res.status(403).send({ error: 'Deleted failed' })
  } catch (e) {
    return res.sendStatus(500)
  }
})

module.exports = router
