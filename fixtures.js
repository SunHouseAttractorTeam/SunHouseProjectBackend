const mongoose = require('mongoose')
const { nanoid } = require('nanoid')
const dayjs = require('dayjs')
const config = require('./config')

const User = require('./models/User')
const Category = require('./models/Category')
const Course = require('./models/Course')
const Module = require('./models/Module')
const Notification = require('./models/Notification')
const Review = require('./models/LendingReview')
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

  const [admin, user, teacher, tom, hel, ban, ben, tel, hall, test] = await User.create(
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
    {
      username: 'Hel',
      email: 'hel@gmail.com',
      password: 'hel',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadawd33a23',
    },
    {
      username: 'Ban',
      email: 'ban@gmail.com',
      password: 'ban',
      token: nanoid(),
      role: 'ban',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadawd33a455',
    },
    {
      username: 'Ben',
      email: 'ben@gmail.com',
      password: 'ben',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadawd33a455dwada',
    },
    {
      username: 'Tel',
      email: 'tel@gmail.com',
      password: 'tel',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadadwadawwd33a455dwada',
    },
    {
      username: 'Hall',
      email: 'hall@gmail.com',
      password: 'hall',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadadwadawwd33adwada455dwada',
    },
    {
      username: 'Test',
      email: 'test@gmail.com',
      password: 'test',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadadwadawdwawadwd33adwada455dwada',
    },
    {
      username: 'Ball',
      email: 'ball@gmail.com',
      password: 'ball',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadadwadwadadawdwawadwd33adwada455dwada',
    },
    {
      username: 'End',
      email: 'end@gmail.com',
      password: 'endddddddd',
      token: nanoid(),
      role: 'user',
      avatar: 'fixtures/tom.jpg',
      authentication: true,
      confirmationCode: 'dwadadwadwaddwaadawdwawadwd33adwada455dwada',
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

  const [frontend, course1, course2, course3] = await Course.create(
    {
      user: teacher._id,
      category: frontendDev._id,
      title: 'Frontend developer',
      description:
        'Этот курс направлен на обучение созданию сайтов и программированию на языке JavaScript, весь материал подносится простым языком. Вы получите много полезных материалов и мы вместе будем применять изученное на практике создавая интересные проекты шаг за шагом.',
      price: 5500,
      dateTime: dayjs().format('DD/MM/YYYY'),
      teachers: [teacher, tom],
      lendingTeachers: [{ user: teacher }],
    },
    {
      user: teacher._id,
      category: clining._id,
      title: 'Course test title',
      description: 'Course test desc',
      price: 5500,
      dateTime: dayjs().format('DD/MM/YYYY'),
      teachers: [teacher, tom],
      lendingTeachers: [
        { user: teacher },
        {
          user: tom,
          description: 'Руководитель правовой практики в сфере ПО, технологий, сделок с брендом и данными ЯНДЕКС',
        },
      ],
      willLearn: [
        {
          title: 'test',
          image: 'fixtures/user.jpg',
          description:
            'Часто в текстах и обучающих материалах название языка сокращают до JS.' +
            'Это язык программирования высокого уровня, то есть код на нем понятный и хорошо читается.',
        },
        {
          title: 'task',
          description: 'Часто в текстах',
        },
        {
          title: 'lesson',
          description: 'Часто в текстах и обучающих материалах название языка сокращают до JS.',
        },
      ],
    },
    {
      user: teacher._id,
      title: 'JavaScript',
      description:
        'JavaScript — это язык программирования, который используют для написания frontend- и backend-частей сайтов,' +
        'а также мобильных приложений. Часто в текстах и обучающих материалах название языка сокращают до JS.' +
        'Это язык программирования высокого уровня, то есть код на нем понятный и хорошо читается.',
      teachers: [teacher],
      lendingTeachers: [{ user: teacher }],
      willLearn: [
        {
          title: 'test',
          image: 'fixtures/user.jpg',
          description:
            'Часто в текстах и обучающих материалах название языка сокращают до JS.' +
            'Это язык программирования высокого уровня, то есть код на нем понятный и хорошо читается.',
        },
        {
          title: 'task',
          description: 'Часто в текстах',
        },
        {
          title: 'lesson',
          description: 'Часто в текстах и обучающих материалах название языка сокращают до JS.',
        },
      ],
      category: frontendDev._id,
      price: 10000,
      dateTime: dayjs().format('DD/MM/YYYY'),
      publish: true,
    },
    {
      user: teacher._id,
      category: webDes._id,
      title: 'Web des',
      description: 'Course test desc',
      price: 1500,
      dateTime: dayjs().format('DD/MM/YYYY'),
      teachers: [teacher],
      lendingTeachers: [{ user: teacher }],
      willLearn: [
        {
          title: 'test',
          image: 'fixtures/user.jpg',
          description:
            'Часто в текстах и обучающих материалах название языка сокращают до JS.' +
            'Это язык программирования высокого уровня, то есть код на нем понятный и хорошо читается.',
        },
        {
          title: 'task',
          description: 'Часто в текстах',
        },
        {
          title: 'lesson',
          description: 'Часто в текстах и обучающих материалах название языка сокращают до JS.',
        },
      ],
      users: [user],
      publish: true,
    },
    {
      user: admin._id,
      category: clining._id,
      title: 'Clining test',
      description: 'Course test desc',
      price: 1500,
      dateTime: dayjs().format('DD/MM/YYYY'),
      teachers: [teacher, admin],
      lendingTeachers: [{ user: teacher }, { user: admin, description: 'Admin ADmin aDmin' }],
      willLearn: [
        {
          title: 'test',
          image: 'fixtures/user.jpg',
          description:
            'Часто в текстах и обучающих материалах название языка сокращают до JS.' +
            'Это язык программирования высокого уровня, то есть код на нем понятный и хорошо читается.',
        },
        {
          title: 'task',
          description: 'Часто в текстах',
        },
        {
          title: 'lesson',
          description: 'Часто в текстах и обучающих материалах название языка сокращают до JS.',
        },
      ],
      publish: true,
    },
    {
      user: admin._id,
      category: frontendDev._id,
      title: 'frontend test',
      description: 'Course test desc',
      price: 15500,
      dateTime: dayjs().format('DD/MM/YYYY'),
      teachers: [admin],
      lendingTeachers: [{ user: admin }],
      willLearn: [
        {
          title: 'test',
          image: 'fixtures/user.jpg',
          description:
            'Часто в текстах и обучающих материалах название языка сокращают до JS.' +
            'Это язык программирования высокого уровня, то есть код на нем понятный и хорошо читается.',
        },
        {
          title: 'task',
          description: 'Часто в текстах',
        },
        {
          title: 'lesson',
          description: 'Часто в текстах и обучающих материалах название языка сокращают до JS.',
        },
      ],
      publish: true,
    },
  )

  const [module, module2, module3, html, css, javascript] = await Module.create(
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
    {
      title: 'HTML',
      course: frontend._id,
    },
    {
      title: 'CSS',
      course: frontend._id,
    },
    {
      title: 'JavaScript',
      course: frontend._id,
    },
  )

  await course1.updateOne({ $push: { modules: module } })
  await course1.updateOne({ $push: { modules: module2 } })
  await course2.updateOne({ $push: { modules: module3 } })
  await frontend.updateOne({ $push: { modules: html } })
  await frontend.updateOne({ $push: { modules: css } })
  await frontend.updateOne({ $push: { modules: javascript } })

  const [lesson1, lesson2, lesson3, lesson4, lesson5] = await Lesson.create(
    {
      title: 'Что такое HTML',
      module: html._id,
      data: [
        {
          text: '<h6><span style="color: rgb(98, 163, 98); font-size: 18px;">HTML (Hypertext Markup Language)</span><span style="color: rgb(0, 0, 0);"> </span><span style="color: rgb(98, 163, 98); font-size: 18px;">- это код, который используется для структурирования и отображения веб-страницы и её контента. Например, контент может быть структурирован внутри множества параграфов, маркированных списков или с использованием изображений и таблиц данных.<span style="color: rgb(0, 0, 0);">​</span></span></h6><p><span style="font-size: 18px;">​</span><br></p>',
        },
        {
          text: '<h1 style="text-align: center;"><span style="font-size: 48px;">HTML</span></h1><p><span style="font-weight: 500;">Теперь мы знаем, что такое </span><em style="font-weight: 500;">разметка</em><span style="font-weight: 500;">, давай узнаем, что такое HTML. Есть вещи, которые проще показать, чем объяснять. HTML - одна из них.</span><br></p><p>Всё гениальное просто. Вот как бы выглядел текст этого урока на HTML:</p><p>​<span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">h1</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)">HTML</span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">h1</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br></span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">p</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)">Теперь мы знаем, что такое </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">i</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)">разметка</span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">i</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)">, давай узнаем, что такое HTML. Есть вещи, которые проще показать, чем объяснять. HTML - одна из них.</span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">p</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br><br></span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">p</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)">Всё гениальное просто. Вот как бы выглядел текст этого урока на HTML:</span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">p</span>&gt;</span>​<br></p><p>h1 - заголовок первого уровня (header 1)</p><p>p - абзац (paragraph)</p><p>i - курсив(italics)</p>',
        },
        {
          video: 'https://www.youtube.com/watch?v=MBe1h80ghKA',
        },
      ],
    },
    {
      title: 'Теги',
      module: html._id,
      data: [
        {
          text: '<p><span style="color: rgb(160, 56, 129)"><span style="color: rgb(102, 204, 102)"><span style="color: rgb(0, 0, 0)">Как ты уже догадался, в HTML для разметки используется особый набор символов. Он называется&nbsp;<strong>тег</strong>.</span></span></span></p><h2><strong><span style="color: rgb(160, 56, 129)"><span style="color: rgb(0, 0, 0)">Что такое тег</span></span></strong></h2><p>Тег — это синтаксическая единица языка HTML, которая выделяет или создаёт элемент. Это набор символов, с помощью которого браузер понимает, где элемент создается, начинается и заканчивается. Есть 2 вида тегов: двойные и одинарные.</p><h2><strong>Двойные теги</strong></h2><p>Двойные теги показывает начало и конец элемента. Начало элемента обозначается открывающим тегом&nbsp;<code>&lt;…&gt;</code>&nbsp;, а конец - закрывающим&nbsp;<code>&lt;/…&gt;</code>.</p><p><strong>Двойной тег обязательно должен быть закрыт</strong>. Даже несмотря на то, что современные браузеры умеют в некоторых случаях понимать разметку без закрытых тегов, лучше всегда закрывать их.</p><h2><strong>Одинарные теги</strong></h2><p>Одинарные теги просто не имеют пары. Примеры: тег переноса строки&nbsp;<code>&lt;br&gt;</code>&nbsp;или горизонтальной линии&nbsp;<code>&lt;hr&gt;</code>.</p><p>Старые браузеры требовали закрывать одинарные теги:&nbsp;<code>&lt;br /&gt;</code>, сейчас таких браузеров практически не осталось и допустимо использовать оба варианта синтаксиса.</p>',
        },
      ],
    },
    {
      title: 'Структура HTML-документа',
      module: html._id,
      data: [
        {
          text: '<h1 style="text-align: center">Структура HTML-документа</h1><p>Структура HTML документа - скелет, на основе которого строится вся страница:</p><p>​<span style="color: rgb(0, 102, 102);font-size: 14.4px">&lt;!DOCTYPE html&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br></span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">html</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br>  </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">head</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br>    </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">meta</span> <span style="color: rgb(102, 0, 102)">charset</span>=<span style="color: rgb(0, 136, 0)">"utf-8"</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br>    </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">title</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)">Страница</span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">title</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br>  </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">head</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br>  </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">body</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br>    </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">h1</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)">...</span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">h1</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br>    </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;<span style="color: rgb(0, 0, 136)">p</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)">...</span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">p</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br>  </span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">body</span>&gt;</span><span style="color: rgb(0, 0, 0);font-size: 14.4px;background-color: rgb(243, 244, 246)"><br></span><span style="color: rgb(0, 0, 0);font-size: 14.4px">&lt;/<span style="color: rgb(0, 0, 136)">html</span>&gt;</span>​<br></p><p><br></p><h2>&lt;!DOCTYPE&gt;</h2><p>Первым тегом в любом HTML документе должен идти тег&nbsp;<code>&lt;!DOCTYPE&gt;</code>. Он говорит браузеру, по какому стандарту написана страница. На рассвете веба HTML существовал в разных несовместимых версиях, поэтому для их одновременной поддержки нужно было указывать версию явно. Сейчас все пришли к одному стандарту - HTML5. Поэтому для всех сайтов, которые создаются сегодня, нужно указывать&nbsp;<code>&lt;!DOCTYPE html&gt;</code>&nbsp;- так обозначается HTML5.</p><h2>&lt;html&gt;</h2><p>Вторым тегом идет&nbsp;<code>&lt;html&gt;</code>&nbsp;- контейнер, который содержит два тега -&nbsp;<code>&lt;head&gt;</code>&nbsp;и&nbsp;<code>&lt;body&gt;</code>. HTML-страница должна заканчиваться закрытым тегом&nbsp;<code>&lt;/html&gt;</code>.</p><h2>&lt;head&gt;</h2><p>В теге&nbsp;<code>&lt;head&gt;</code>&nbsp;хранится информация о странице. Здесь указывают&nbsp;<a href="https://myrusakov.ru/html-kodirovka.html" rel="nofollow noopener noreferrer" target="_blank">кодировку</a>&nbsp;<code>&lt;meta charset="..."&gt;</code>, имя страницы&nbsp;<code>&lt;title&gt;...&lt;/title&gt;</code>, специальную информацию для поисковиков, а ещё тут подключаются стилевые файлы и скрипты.</p><p>Тег&nbsp;<code>&lt;head&gt;</code>&nbsp;не отображается. Его цель — сказать браузеру информацию о странице.</p><h2>&lt;body&gt;</h2><p>В теге&nbsp;<code>&lt;body&gt;</code>&nbsp;размещается весь контент страницы, который пользователь увидит в браузере.</p>',
        },
      ],
    },
    {
      title: 'CSS',
      module: css._id,
      data: [
        {
          text: '<h1 style="text-align: center;"><span style="font-size: 36px;">CSS</span></h1><div><span style="font-size: 16px;">CSS (/siːɛsɛs/ англ. Cascading Style Sheets «каскадные таблицы стилей») —&nbsp;</span><strong style="font-size: 16px;">формальный язык описания внешнего вида документа (веб-страницы), написанного с использованием языка разметки (чаще всего HTML или XHTML)</strong><span style="font-size: 16px;">.</span><br><path></path></div>',
        },
      ],
    },
    {
      title: 'О JavaScript',
      module: html._id,
      data: [
        {
          text: '<p><strong>JavaScript</strong>&nbsp;(принято произносить "Джаваскрипт") - это язык программирования, выполняющийся на стороне пользователя с помощью браузера. Он позволяет управлять элементами веб-страницы - заставлять их менять свои свойства и расположение, двигаться, реагировать на события, такие как перемещение мыши или нажатия клавиатуры, а также создавать множество других интересных эффектов.</p><p>&nbsp;</p><p><strong>JavaScript</strong>&nbsp;часто сокращают до аббревиатуры&nbsp;<strong>JS</strong>, что часто используется в названиях различных фреймворков (Vue.js, Ember.js), а также в расширении файлов с JavaScript-кодом.</p><p>&nbsp;</p><p><strong>JavaScript</strong>&nbsp;как название является зарегистрированной торговой маркой и принадлежит компании&nbsp;<span style="color: rgb(255, 67, 99)">ORACLE<span style="color: rgb(0, 0, 0)">.</span></span></p><p>&nbsp;</p><p><strong>JavaScript</strong>&nbsp;родился 4 декабря 1995 года, по крайней мере, именно в этот день язык получил свое имя. Ранее он назывался LiveScript и разрабатывался совместно корпорациями<span style="color: rgb(255, 67, 99)">&nbsp;<span style="color: rgb(102, 204, 102)">Netscape Communications</span>&nbsp;</span>и<span style="color: rgb(255, 67, 99)">&nbsp;<span style="color: rgb(102, 204, 102)">Sun Microsystems</span>&nbsp;</span>как язык для управления элементами и обеспечения взаимодействия составляющих частей веб-ресурсов - изображениями, плагинами, Java-апплетами и другими элементами, используемыми при создании веб-страниц.</p><p>&nbsp;</p><p><strong>JavaScript</strong>&nbsp;имеет синтаксис схожий с языком Си, однако имеет ряд существенных отличий:</p><p> - Возможность работы с объектами, в том числе определение типа и структуры объекта во время выполнения программы.</p><p> - Возможность передавать и возвращать функции как параметры, а также присваивать их переменной.</p><p> - Наличие механизма автоматического приведения типов.</p><p> - Автоматическая сборка мусора.</p><p> - Использование анонимных функций.</p><p>Эти возможности обязательно будут рассмотрены в следующих уроках.</p>',
        },
        {
          video: 'https://www.youtube.com/watch?v=As112XYv15w',
        },
      ],
    },
  )

  await html.updateOne({ $push: { data: { title: lesson1.title, type: lesson1.type, _id: lesson1._id } } })
  await html.updateOne({ $push: { data: { title: lesson2.title, type: lesson2.type, _id: lesson2._id } } })
  await html.updateOne({ $push: { data: { title: lesson3.title, type: lesson3.type, _id: lesson3._id } } })
  await css.updateOne({ $push: { data: { title: lesson4.title, type: lesson4.type, _id: lesson4._id } } })
  await javascript.updateOne({ $push: { data: { title: lesson5.title, type: lesson5.type, _id: lesson5._id } } })

  const [task1, task2, task3, task4, task5, task6, task7, task8, task9] = await Task.create(
    {
      title: 'Task 1',
      module: module._id,
    },
    {
      title: 'Task 2',
      module: module._id,
    },
    {
      title: 'Task 3',
      module: module._id,
    },
    {
      title: 'Task 4',
      module: module._id,
    },
    {
      title: 'Task 5',
      module: module2._id,
    },
    {
      title: 'Task 6',
      module: module2._id,
    },
    {
      title: 'Task 7',
      module: module2._id,
    },
    {
      title: 'Task 8',
      module: module3._id,
    },
    {
      title: 'Функции',
      module: javascript._id,
      data: [
        {
          video: 'https://www.youtube.com/watch?v=RfW4MwkT0hw',
        },
        {
          text: '<p style="text-align: center;"><span style="font-size: 28px;">Посмотрите видео и напишите функцию(файл нужно прикрепить и отправить). Покажите чему вы научились в видео.</span></p>',
        },
      ],
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

  await course1.updateOne({
    $push: {
      pendingTasks: {
        user: tom._id,
        file: 'test.docx',
        task: task3._id,
      },
    },
  })
  await course1.updateOne({
    $push: {
      pendingTasks: {
        user: user._id,
        file: 'test1.docx',
        task: task3._id,
      },
    },
  })

  const [test1, test2, test3, test4, test5, testHtml, testJS] = await Test.create(
    {
      title: 'test 1',
      module: module._id,
      questions: [
        {
          title: 'вопрос первого теста?',
          answers: [{ title: 'ответ11', status: true }, { title: 'ответ12' }, { title: 'ответ13' }],
        },
        {
          title: 'второй вопрос первого теста?',
          answers: [{ title: 'ответ21', status: false }, { title: 'ответ22' }, { title: 'ответ23' }],
        },
        {
          title: 'третий вопрос первого теста?',
          answers: [{ title: 'ответ31', status: false }, { title: 'ответ32' }, { title: 'ответ33' }],
        },
      ],
    },
    {
      title: 'test 2',
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
      module: module3._id,
      questions: [
        {
          title: 'что лучше Амд, Нвидиа или Интел?',
          answers: [{ title: 'Интел' }, { title: 'Амд', status: true }, { title: 'Нвидиа' }],
        },
      ],
    },
    {
      title: 'HTML',
      module: html._id,
      questions: [
        {
          title: 'Что такое HTML?',
          answers: [
            {
              title: 'это код, который используется для структурирования и отображения веб-страницы и её контента.',
              status: true,
            },
            {
              title:
                'то набор символов, с помощью которого браузер понимает, где элемент создается, начинается и заканчивается',
            },
            {
              title:
                'формальный язык описания внешнего вида документа (веб-страницы), написанного с использованием языка разметки',
            },
          ],
        },
        {
          title: 'Выберите подходящий ответ из списка',
          answers: [
            {
              title: '<p>Нет на свете мук сильнее муки слова: <br> Тщетно с уст порой безумный рвется крик</p>',
              status: true,
            },
            {
              title: '<h1>Давным-давно....<h1>',
            },
            {
              title: '<h1>Давным-давно....',
            },
          ],
        },
        {
          title: 'Выберите правильный ответ',
          answers: [
            {
              title: 'В теге <body> размещается весь видимый контент страницы',
              status: true,
            },
            {
              title: 'В теге <head> прописывается меню и шапка сайта',
            },
            {
              title: 'Тег <html> - это контейнер, которой показывает браузеру на каком языке написан код.',
            },
          ],
        },
      ],
    },
    {
      title: 'О JavaScript',
      module: javascript._id,
      questions: [
        {
          title: 'В каком году язык JavaScript получил свое имя?',
          answers: [{ title: '2004' }, { title: '1995', status: true }, { title: '1994' }],
        },
        {
          title: 'Кто является владельцем торговой марки JavaScript?',
          answers: [
            { title: 'Microsoft Corporation' },
            { title: 'Oracle Corporation', status: true },
            { title: 'Sun Microsystems' },
          ],
        },
      ],
    },
  )

  await module.updateOne({ $push: { data: { title: test1.title, type: test1.type, _id: test1._id } } })
  await module.updateOne({ $push: { data: { title: test2.title, type: test2.type, _id: test2._id } } })
  await module2.updateOne({ $push: { data: { title: test3.title, type: test3.type, _id: test3._id } } })
  await module2.updateOne({ $push: { data: { title: test4.title, type: test4.type, _id: test4._id } } })
  await module3.updateOne({ $push: { data: { title: test5.title, type: test5.type, _id: test5._id } } })
  await html.updateOne({ $push: { data: { title: testHtml.title, type: testHtml.type, _id: testHtml._id } } })
  await javascript.updateOne({ $push: { data: { title: testJS.title, type: testJS.type, _id: testJS._id } } })
  await javascript.updateOne({ $push: { data: { title: task9.title, type: task9.type, _id: task9._id } } })

  await tom.updateOne({
    $push: {
      tests: {
        test: test1,
        answers: [
          { questionId: test1.questions[0]._id, question: test1.questions[0].title, answer: true },
          { questionId: test1.questions[1]._id, question: test1.questions[1].title, answer: false },
          { questionId: test1.questions[2]._id, question: test1.questions[2].title, answer: false },
        ],
      },
    },
  })

  await tom.updateOne({
    $push: {
      tests: {
        test: test2,
        status: true,
        answers: [{ questionId: test2.questions[0]._id, question: test1.questions[0].title, answer: true }],
      },
    },
  })

  await tom.updateOne({
    $push: {
      tests: {
        test: test3,
        status: true,
        answers: [{ questionId: test3.questions[0]._id, question: test1.questions[0].title, answer: true }],
      },
    },
  })

  await user.updateOne({
    $push: {
      tests: {
        test: test3,
        status: true,
        answers: [{ questionId: test3.questions[0]._id, question: test1.questions[0].title, answer: true }],
      },
    },
  })
  await Review.create(
    {
      name: 'Биба',
      description: 'lorem ipsum text',
      socialNetwork: 'instagram',
    },
    {
      name: 'Боба',
      description: 'lorem',
      socialNetwork: 'instagram',
    },
    {
      name: 'Пупа',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      socialNetwork: 'instagram',
    },
    {
      name: 'Лупа',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been',
      socialNetwork: 'instagram',
    },
    {
      name: 'Пупсень',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      socialNetwork: 'instagram',
    },
    {
      name: 'Вупсень',
      description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
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
      view: true,
    },
    {
      type: 'info',
      description: 'У вас появился 1 ученик!',
      user: teacher._id,
      view: true,
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
