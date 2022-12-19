const mongoose = require('mongoose')
const { nanoid } = require('nanoid')
const dayjs = require('dayjs')
const config = require('./config')

const User = require('./models/User')
const Category = require('./models/Category')
const Course = require('./models/Course')
const Module = require('./models/Module')
const Notification = require('./models/Notification')
const Review = require('./models/Review')
const Task = require('./models/Task')
const Test = require('./models/Test')
const Lesson = require('./models/Lesson')

const run = async () => {
  await mongoose.connect(config.mongo.db)

  const collections = await mongoose.connection.db.listCollections().toArray()

  // eslint-disable-next-line no-restricted-syntax
  for (const coll of collections) {
    // eslint-disable-next-line no-await-in-loop
    await mongoose.connection.db.dropCollection(coll.name)
  }

  const [admin, user, teacher, tom] = await User.create(
    {
      username: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin',
      token: nanoid(),
      role: 'admin',
      avatar: 'fixtures/admin.png',
      authentication: true,
      confirmationCode: 'dwadaw',
    },
    {
      username: 'User',
      email: 'user@gmail.com',
      password: 'user',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/user.jpg',
      authentication: true,
      confirmationCode: 'ddawd',
    },
    {
      username: 'Teacher',
      email: 'teacher@gmail.com',
      password: 'teacher',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/teacher.jpg',
      authentication: true,
      confirmationCode: 'dwadwadwa',
    },
    {
      username: 'Tom',
      email: 'tom@gmail.com',
      password: 'tom',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadawd33a',
    },
  )

  const [webDes, frontendDev, uxuiDes, clining] = await Category.create(
    {
      title: 'Web-дизайнер',
      description: `Веб-дизайнер проектирует сайты и приложения. 
      Его визуальные решения напрямую влияют на восприятие бренда, а иногда и продажи. 
      Поэтому рынку нужны талантливые веб-дизайнеры, а работодатели готовы им хорошо платить.`,
    },
    {
      title: 'Front-end разработчик',
      description: ` это специалист, который занимается разработкой пользовательского интерфейса,
       то есть той части сайта или приложения, которую видят посетители страницы.
        Главная задача фронтенд разработчика — 
        перевести готовый дизайн-макет в код так, чтобы все работало правильно.`,
    },
    {
      title: 'UX-UI дизайнер',
      description: `дизайнер изучает потребности пользователей, 
      разрабатывает логические схемы работы интерфейса и тестирует их на целевой аудитории`,
    },
    {
      title: 'Обучение горничных',
      description: `бла бла бла`,
    },
  )

  const [course1, course2] = await Course.create(
    {
      user: teacher._id,
      category: clining._id,
      title: 'Course test title',
      description: 'Course test desc',
      price: 5500,
      dateTime: dayjs().format('DD/MM/YYYY'),
      rating: [
        { user: admin, value: 0 },
        { user, value: 3 },
      ],
      teachers: [teacher, tom],
      users: [user],
    },
    {
      user: teacher._id,
      title: 'JavaScript',
      description:
        'JavaScript — это язык программирования, который используют для написания frontend- и backend-частей сайтов,' +
        'а также мобильных приложений. Часто в текстах и обучающих материалах название языка сокращают до JS.' +
        'Это язык программирования высокого уровня, то есть код на нем понятный и хорошо читается.',
      rating: [
        { user: admin, value: 5 },
        { user, value: 5 },
      ],
      teachers: [teacher],
      users: [user, tom],
      category: frontendDev._id,
      price: 10000,
      dateTime: dayjs().format('DD/MM/YYYY'),
      publish: true,
    },
  )

  const [module, module2, module3] = await Module.create(
    {
      title: 'Module 1',
      course: course1._id,
    },
    {
      title: 'Module 2',
      course: course1._id,
    },
    {
      title: 'Module 3',
      course: course2._id,
    },
  )

  await course1.updateOne({ $push: { modules: module } })
  await course1.updateOne({ $push: { modules: module2 } })
  await course2.updateOne({ $push: { modules: module3 } })

  const [lesson1, lesson2] = await Lesson.create(
    {
      title: 'This 1 lesson for course',
      description: 'lesson 1 for test',
      module: module._id,
    },
    {
      title: 'This 2 lesson for course',
      description: 'lesson 2 for test',
      module: module2._id,
    },
  )

  await module.updateOne({ $push: { data: { title: lesson1.title, type: lesson1.type, _id: lesson1._id } } })
  await module2.updateOne({ $push: { data: { title: lesson2.title, type: lesson2.type, _id: lesson2._id } } })

  const [task1, task2, task3, task4, task5, task6, task7, task8] = await Task.create(
    {
      title: 'Task 1',
      description: 'task 1 description',
      module: module._id,
    },
    {
      title: 'Task 2',
      description: 'task 2 description',
      module: module._id,
    },
    {
      title: 'Task 3',
      description: 'task 3 description',
      module: module._id,
    },
    {
      title: 'Task 4',
      description: 'task 4 description',
      module: module._id,
    },
    {
      title: 'Task 5',
      description: 'task 5 description',
      module: module2._id,
    },
    {
      title: 'Task 6',
      description: 'task 6 description',
      module: module2._id,
    },
    {
      title: 'Task 7',
      description: 'task 7 description',
      module: module2._id,
    },
    {
      title: 'Task 8',
      description: 'task 8 description',
      module: module3._id,
    },
  )

  await module.updateOne({ $push: { data: { title: task1.title, type: task1.type, _id: task1._id } } })
  await module.updateOne({ $push: { data: { title: task2.title, type: task2.type, _id: task2._id } } })
  await module.updateOne({ $push: { data: { title: task3.title, type: task3.type, _id: task3._id } } })
  await module.updateOne({ $push: { data: { title: task4.title, type: task4.type, _id: task4._id } } })
  await module2.updateOne({ $push: { data: { title: task5.title, type: task5.type, _id: task5._id } } })
  await module2.updateOne({ $push: { data: { title: task6.title, type: task6.type, _id: task6._id } } })
  await module2.updateOne({ $push: { data: { title: task7.title, type: task7.type, _id: task7._id } } })
  await module3.updateOne({ $push: { data: { title: task8.title, type: task8.type, _id: task8._id } } })

  const [test1, test2, test3, test4, test5] = await Test.create(
    {
      title: 'test 1',
      description: 'lorem 10 ipsum',
      module: module._id,
      questions: [
        {
          title: 'это какой тест?',
          answers: [{ title: '1', status: true }, { title: '2' }, { title: '3' }],
        },
      ],
    },
    {
      title: 'test 2',
      description: 'lorem 10 ipsum',
      module: module._id,
      questions: [
        {
          title: 'это какой тест?',
          answers: [{ title: '1' }, { title: '2', status: true }, { title: '3' }],
        },
        {
          title: 'это какой день?',
          answers: [{ title: '1' }, { title: '4', status: true }, { title: '3' }],
        },
        {
          title: 'это какой год?',
          answers: [{ title: '1' }, { title: '2', status: true }, { title: '3' }],
        },
      ],
    },
    {
      title: 'test 3',
      description: 'lorem 10 ipsum',
      module: module2._id,
      questions: [
        {
          title: 'это какой тест?',
          answers: [{ title: '1', status: true }, { title: '2' }, { title: '3', status: true }],
        },
      ],
    },
    {
      title: 'test 4',
      description: 'lorem 10 ipsum',
      module: module2._id,
      questions: [
        {
          title: 'Кто мы?',
          answers: [{ title: 'мы', status: true }, { title: 'я' }, { title: 'ты' }],
        },
      ],
    },
    {
      title: 'test 5',
      description: 'lorem 10 ipsum',
      module: module3._id,
      questions: [
        {
          title: 'что лучше Амд, Нвидиа или Интел?',
          answers: [{ title: 'Интел' }, { title: 'Амд', status: true }, { title: 'Нвидиа' }],
        },
      ],
    },
  )

  await module.updateOne({ $push: { data: { title: test1.title, type: test1.type, _id: test1._id } } })
  await module.updateOne({ $push: { data: { title: test2.title, type: test2.type, _id: test2._id } } })
  await module2.updateOne({ $push: { data: { title: test3.title, type: test3.type, _id: test3._id } } })
  await module2.updateOne({ $push: { data: { title: test4.title, type: test4.type, _id: test4._id } } })
  await module3.updateOne({ $push: { data: { title: test5.title, type: test5.type, _id: test5._id } } })
  await user.updateOne({ $push: { tests: { test: test5 } } })
  await user.updateOne({ $push: { tests: { test: test2 } } })

  await Review.create(
    {
      user: user._id,
      text: 'lorem ipsum text',
      socialNetwork: 'instagram',
    },
    {
      user: admin._id,
      text: 'lorem',
      socialNetwork: 'instagram',
    },
    {
      user: user._id,
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      socialNetwork: 'instagram',
    },
    {
      user: admin._id,
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      socialNetwork: 'instagram',
    },
    {
      user: teacher._id,
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      socialNetwork: 'instagram',
    },
    {
      user: tom._id,
      text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      socialNetwork: 'instagram',
    },
  )

  await Notification.create(
    {
      type: 'info',
      description: 'Вы учитель!',
      user: teacher._id,
    },
    {
      type: 'info',
      description: 'У вас появилось 2 курса!',
      user: teacher._id,
    },
    {
      type: 'info',
      description: 'У вас появился 1 ученик!',
      user: teacher._id,
    },
    {
      type: 'info',
      description: 'У вас появился 1 курс!',
      user: user._id,
    },
    {
      type: 'info',
      description: 'Вы ученик!',
      user: user._id,
    },
    {
      type: 'info',
      description:
        'Ну это длинные текст что бы посмотреть как будет выглядеть длинное уведомление на странице. вцфв фв фцв цф вфц ф цвфц вф цф вфц',
      user: user._id,
    },
  )

  await mongoose.connection.close()
}

run().catch(console.error)
