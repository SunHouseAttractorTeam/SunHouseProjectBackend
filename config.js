const path = require('path')

const rootPath = __dirname

module.exports = {
  rootPath,
  uploadPath: path.join(rootPath, 'public/uploads'),
  mongo: {
    db: 'mongodb+srv://user:19630185@cluster0.g0oxsth.mongodb.net/?retryWrites=true&w=majority',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },
}
