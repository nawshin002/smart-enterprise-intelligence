const express = require('express')
const router = express.Router()

const {
  getDocuments,
  removeDocument,
} = require('../controllers/documentController')

// GET all documents
router.get('/', getDocuments)

// DELETE a document
router.delete('/:id', removeDocument)

module.exports = router