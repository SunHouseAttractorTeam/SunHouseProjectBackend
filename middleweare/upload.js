const multer = require('multer')
const { nanoid } = require('nanoid')
const config = require('../config')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadPath)
  },
  filename: (req, file, cb) => {
    const re = / /g
    const newstr = file.originalname.replace(re, '-')
    cb(null, nanoid(10) + newstr)
  },
})

module.exports = multer({ storage })
