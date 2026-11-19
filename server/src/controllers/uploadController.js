const db = require('../config/db')

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF document.',
      })
    }

    const newDocument = {
      name: req.file.originalname,
      size: (req.file.size / 1024).toFixed(2),
      mimetype: req.file.mimetype,
      filename: req.file.filename,
      status: 'Uploaded',
    }

    const [result] = await db.execute(
      `INSERT INTO documents
       (document_name, stored_filename, file_size, mime_type, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        newDocument.name,
        newDocument.filename,
        newDocument.size,
        newDocument.mimetype,
        newDocument.status,
      ]
    )

    newDocument.id = result.insertId
    newDocument.uploadedAt = new Date().toISOString()

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