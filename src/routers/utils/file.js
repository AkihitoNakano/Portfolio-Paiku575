const multer = require('multer')
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
const { Storage } = require('@google-cloud/storage')

let projectId = 'paiku-357914'
let keyFilename = './key/paikuKey.json'

const storage = new Storage({
  projectId,
  keyFilename,
})

const bucket = storage.bucket('paiku_file_uploads')

// file upload middleware
const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 2 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an avatar image'))
    }

    cb(undefined, true)
  },
})

const upImg = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an card image'))
    }

    cb(undefined, true)
  },
})

async function uploadImageToCloudStorage(file, type) {
  const image = await resizeImage(file, type)

  const fileName = setUniqueName(type)
  const blob = bucket.file(fileName)

  await blob.save(image)

  return fileName
}

async function resizeImage(file, type) {
  let image

  try {
    if (type === 'avatar') {
      image = await sharp(file.buffer).resize({ width: 128, height: 128 }).png().toBuffer()
    } else if (type === 'card') {
      image = await sharp(file.buffer).resize({ width: 230, height: 415 }).png().toBuffer()
    }
    return image
  } catch (err) {
    console.log(err)
  }
}

// uuidを使ってユニークネームを作成する
function setUniqueName(type) {
  const folderNumber = Math.floor(Math.random() * 100)
  const id = uuidv4()
  const postName = `${type}/${folderNumber}/${id}.png`
  return postName
}

async function deleteImageInCloudStorage(fileName) {
  bucket.file(fileName).delete()
}

module.exports = {
  uploadAvatar,
  upImg,
  uploadImageToCloudStorage,
  deleteImageInCloudStorage,
}
