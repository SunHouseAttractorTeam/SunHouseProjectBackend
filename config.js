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
    appId: '5912743682160832',
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },
  google: {
    clientId: '320044799333-r151su7af1nmosequ05tmalg8n83tvtl.apps.googleusercontent.com',
    appSecret: process.env.GOOGLE_APP_SECRET,
  },
  vk: {
    appId: '51471263',
    personalToken: process.env.PERSONAL_TOKEN,
    appSecret: process.env.VK_APP_SECRET,
  },
}
