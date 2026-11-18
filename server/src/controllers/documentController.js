
const fs = require('fs')
const path = require('path')

const {
  getAllDocuments,
  deleteDocument,
} = require('../config/documentStore')

// Get all uploaded documents
const getDocuments = (req, res) => {
  try {
    const documents = getAllDocuments()

    res.status(200).json({
      success: true,
      message: 'Documents retrieved successfully',
      data: documents,
    })
  } catch (error) {
    console.error('Fetch documents error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents.',
    })
  }
}

// Delete a document
const removeDocument = (req, res) => {
  try {
    const { id } = req.params

    const documents = getAllDocuments()
    const document = documents.find((doc) => doc.id === id)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      })
    }

    const filePath = path.join(
      __dirname,
      '../../uploads',
      document.filename
    )

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    deleteDocument(id)

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
    })
  } catch (error) {
    console.error('Delete document error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to delete document.',
    })
  }
}

module.exports = {
  getDocuments,
  removeDocument,
}
