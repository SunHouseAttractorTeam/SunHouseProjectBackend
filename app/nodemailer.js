require("dotenv").config()
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
);

module.exports.sendConfirmationCode = (name, email, confirmationCode) => {
    console.log('NAME: ', name)
    console.log('email: ', email)
    console.log('confirmationCode: ', confirmationCode)
    transporter.sendMail({
        from: process.env.USER_GMAIL,
        to: email,
        subject: "Please confirm your account",
        html: `
        <h1>Email confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank for your attention. Please confirm your email by clicking on the following link</p>
        <a href="http://localhost:3000/confirm/${confirmationCode}">Click here</a>
      `
    }).catch(err => console.error(err));
};
