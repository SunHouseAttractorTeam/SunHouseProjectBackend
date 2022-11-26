const path = require('path')

const rootPath = __dirname

module.exports = {
  rootPath,
  uploadPath: path.join(rootPath, 'public/uploads'),
  mongo: {
    db: 'mongodb://localhost/sun_house_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  vk: {
    appId: process.env.VK_APP_ID,
    personalToken: process.env.PERSONAL_TOKEN,
    appSecret: process.env.VK_APP_SECRET,
  },
}

