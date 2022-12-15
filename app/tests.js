const express = require('express')

const { _logFunc } = require('nodemailer/lib/shared')
const Test = require('../models/Test')
const Module = require('../models/Module')
const Course = require('../models/Course')
const auth = require('../middleweare/auth')
const permit = require('../middleweare/permit')
const User = require('../models/User')

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

    if (!test) return res.status(404).send({ message: 'Test no found' })

    return res.send(test)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.post('/', auth, permit('admin', 'user'), async (req, res) => {
  const moduleId = req.query.module

  try {
    const module = await Module.findOne({ _id: moduleId })

    if (!module) {
      return res.status(404).send({ message: 'There are no such module!' })
    }

    const { title, data, random, correct, count, questions } = req.body

    if (!title) {
      return res.status(401).send({ message: 'Data not valid' })
    }

    const testData = {
      title,
      questions,
      random,
      correct,
      count,
      data,
      file: null,
    }

    if (req.file) {
      switch (req.file.type) {
        case 'file':
          testData.file = req.file.file
          break
        case 'video':
          testData.video = req.file.file
          break
        case 'audio':
          testData.audio = req.file.file
          break
        default:
          return testData
      }
    }

    const test = new Test(testData)
    await test.save()

    module.data.push({
      id: test._id,
      type: test.type,
      title: test.title,
    })

    await module.save()
    return res.send(test)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.put('/:id', auth, permit('admin', 'user'), async (req, res) => {
  try {
    const moduleId = req.query.module
    const courseId = req.query.courses

    const course = await Course.findById(courseId)
    const { title, description, questions, random, correct, count } = req.body

    if (!course) return res.status(404).send({ message: 'There are no such course' })

    if (!course.teachers.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(404).send({ message: 'Authorization error!' })
    }

    if (!title || !description || !questions) {
      return res.status(401).send({ message: 'Data not valid' })
    }

    const testData = {
      title,
      description,
      questions,
      random,
      correct,
      count,
      file: null,
      video: null,
      audio: null,
    }

    if (req.file) {
      switch (req.file.type) {
        case 'file':
          testData.file = req.file.file
          break
        case 'video':
          testData.video = req.file.file
          break
        case 'audio':
          testData.audio = req.file.file
          break
        default:
          return testData
      }
    }

    const test = await Test.findById(req.params.id)

    if (!test) return res.status(404).send({ message: 'Test not found' })

    const updateTest = await Test.findByIdAndUpdate(req.params.id, testData)
    await updateTest.save()

    if (test.title !== updateTest.title) {
      const module = await Module.findOne({ _id: moduleId })

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      const itemToData = {
        id: updateTest._id,
        type: updateTest.type,
        title: updateTest.title,
      }

      module.data = await Promise.all(
        module.data.map(item => {
          if (updateTest._id.toString() === item.id.toString()) return itemToData
          return item
        }),
      )

      await module.save()
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

    if (!test) return res.status(404).send({ message: 'Test not found' })

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
                return testObj.answers.push({ question: userQuestion.question, status: answer })
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

    user.tests = await Promise.all(
      user.tests.map(testObj => {
        // eslint-disable-next-line no-return-assign
        if (testObj.test.equals(testId)) return (testObj.condition = true)
        return testObj
      }),
    )

    await user.save({ validateBeforeSave: false })

    return res.send(user)
  } catch (e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

router.delete('/:id', auth, permit('admin', 'user'), async (req, res) => {
  try {
    const moduleId = req.query.module
    const courseId = req.query.course
    const test = await Test.findById(req.params.id)
    const course = await Course.findById(courseId)

    if (!course) return res.status(404).send({ message: 'Course not found!' })

    if (!course.teachers.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(404).send({ message: 'Authorization error!' })
    }

    if (!test) {
      return res.status(404).send({ message: 'Test not found' })
    }

    const response = await Test.deleteOne({ _id: req.params.id })

    if (response.deletedCount) {
      const module = await Module.findOne({ _id: moduleId })

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      module.data = module.data.filter(item => item.id !== test._id)
      await module.save()

      return res.send('Success')
    }

    return res.status(403).send({ error: 'Deleted failed' })
  } catch (e) {
    return res.sendStatus(500)
  }
})

module.exports = router
