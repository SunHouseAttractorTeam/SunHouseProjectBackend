require('dotenv').config()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_GMAIL,
    pass: process.env.APP_PASSWORD,
  },
})

module.exports.sendConfirmationCode = (name, email, confirmationCode) => {
  transporter
    .sendMail({
      from: process.env.USER_GMAIL,
      to: email,
      subject: 'Please confirm your account',
      html: `
        <h1>Email confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank for your attention. Please confirm your email by clicking on the following link</p>
        <a href="http://localhost:3000/confirm/${confirmationCode}">Click here</a>
      `,
    })
    .catch(err => console.error(err))
}
