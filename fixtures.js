const mongoose = require('mongoose')
const { nanoid } = require('nanoid')
const dayjs = require('dayjs')
const config = require('./config')

const User = require('./models/User')
const Category = require('./models/Category')
const Course = require('./models/Course')
const Module = require('./models/Module')
const Notification = require('./models/Notification')
const Reviews = require('./models/Reviews')
const Task = require('./models/Task')
const Test = require('./models/Test')

const run = async () => {
  await mongoose.connect(config.mongo.db)

  const collections = await mongoose.connection.db.listCollections().toArray()

  collections.forEach(coll => {
    mongoose.connection.db.dropCollection(coll.name)
  })

  const [admin, user, teacher, tom] = await User.create(
    {
      username: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin',
      token: nanoid(),
      role: 'admin',
      avatar: 'fixtures/admin.png',
      authentication: true,
    },
    {
      username: 'User',
      email: 'user@gmail.com',
      password: 'user',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/user.jpg',
      authentication: true,
    },
    {
      username: 'Teacher',
      email: 'teacher@gmail.com',
      password: 'teacher',
      token: nanoid(),
      role: 'teacher',
      avatar: 'fixtures/teacher.jpg',
      authentication: true,
    },
    {
      username: 'Tom',
      email: 'tom@gmail.com',
      password: 'tom',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
    },
  )

  const [web_des, frontend_dev, uxui_des, clining] = await Category.create(
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
      category: frontend_dev,
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

  await course1.updateOne({ $push: { modules: [module, module2] } })
  await course2.updateOne({ $push: { modules: module3 } })
  await course1.updateOne({ $push: { users: user } })

  const [task1, task2, task3, task4, task5, task6, task7, task8] = await Task.create(
    {
      title: 'Task 1',
      description: 'task 1 description',
    },
    {
      title: 'Task 2',
      description: 'task 2 description',
    },
    {
      title: 'Task 3',
      description: 'task 3 description',
    },
    {
      title: 'Task 4',
      description: 'task 4 description',
    },
    {
      title: 'Task 5',
      description: 'task 5 description',
    },
    {
      title: 'Task 6',
      description: 'task 6 description',
    },
    {
      title: 'Task 7',
      description: 'task 7 description',
    },
    {
      title: 'Task 8',
      description: 'task 8 description',
    },
  )

  await module.updateOne({ $push: { data: [task1, task2, task3, task4, task5, task6, task7, task8] } })

  const [test1, test2, test3, test4] = await Test.create(
    {
      title: 'test 1',
      description: 'lorem 10 ipsum',
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
      questions: [
        {
          title: 'это какой тест?',
          answers: [{ title: '1' }, { title: '2', status: true }, { title: '3' }],
        },
      ],
    },
    {
      title: 'test 3',
      description: 'lorem 10 ipsum',
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
      questions: [
        {
          title: 'Кто мы?',
          answers: [{ title: 'мы', status: true }, { title: 'я' }, { title: 'ты' }],
        },
      ],
    },
  )

  await module.updateOne({ $push: { data: [test1, test2, test3, test4] } })

  await Reviews.create(
    {
      user: user._id,
      text: 'lorem ipsum text',
    },
    {
      user: admin._id,
      text: 'lorem',
    },
    {
      user: user._id,
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    },
    {
      user: admin._id,
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    },
    {
      user: teacher._id,
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    },
    {
      user: tom._id,
      text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
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
