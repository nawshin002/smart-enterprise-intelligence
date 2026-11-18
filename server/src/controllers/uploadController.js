
const { addDocument } = require('../config/documentStore')

const uploadDocument = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF document.',
      })
    }

    const newDocument = {
      id: req.file.filename,
      name: req.file.originalname,
      size: (req.file.size / 1024).toFixed(2),
      mimetype: req.file.mimetype,
      filename: req.file.filename,
      status: 'Uploaded',
      uploadedAt: new Date().toISOString(),
    }

    addDocument(newDocument)

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully!',
      data: newDocument,
    })
  } catch (error) {
    console.error('Upload error:', error)

    res.status(500).json({
      success: false,
      message: 'Document upload failed.',
    })
  }
}

module.exports = {
  uploadDocument,
}
