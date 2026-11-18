
const express = require('express')
const router = express.Router()

const upload = require('../config/uploadConfig')
const { uploadDocument } = require('../controllers/uploadController')

// POST upload document
router.post('/', upload.single('document'), uploadDocument)

module.exports = router
