const mongoose = require('mongoose')
const { nanoid } = require('nanoid')
const dayjs = require('dayjs')
const config = require('./config')

const User = require('./models/User')
const Category = require('./models/Category')
const Course = require('./models/Course')

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

  await Course.create({
    category: clining._id,
    title: 'Course test title',
    description: 'Course test desc',
    price: 5500,
    dateTime: dayjs().format('DD/MM/YYYY'),
  })

  await mongoose.connection.close()
}

run().catch(console.error)
