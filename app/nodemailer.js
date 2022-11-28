const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport(
  {
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER_GMAIL,
      pass: process.env.APP_PASSWORD,
    },
  },
  {
    from: 'Mailer Test <ilimalybekov@mail.ru>',
  },
)

const mailer = message => {
  transporter.sendMail(message, (err, info) => {
    if (err) return console.log(err)
    console.log('Email sent: ', info)
    return info
  })
}

module.exports = mailer
