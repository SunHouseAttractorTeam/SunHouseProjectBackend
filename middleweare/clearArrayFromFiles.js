const fs = require('fs')
const config = require('../config')

const deleteFile = file => {
  const fixture = file.split('/')
  if (fixture[0] === 'fixtures') return
  // eslint-disable-next-line node/prefer-promises/fs
  fs.unlink(`${config.uploadPath}/${file}`, err => {
    if (err) {
      console.log(err)
      return
    }

    console.log('Delete File successfully.')
  })
}

const clearArrayFromFiles = (oldData, newData) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const obj of oldData) {
    if (obj.audio) {
      if (newData.length === 0) {
        deleteFile(obj.audio)
      }

      if (newData.length !== 0) {
        for (let i = 0; i < newData.length; i += 1) {
          if (obj.audio === newData[i].audio) {
            break
          }

          const last = i + 2
          if (last > newData.length) {
            deleteFile(obj.audio)
          }
        }
      }
    }
  }
}

module.exports = { clearArrayFromFiles, deleteFile }
