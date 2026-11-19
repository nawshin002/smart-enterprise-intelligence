
const fs = require('fs')
const path = require('path')
const db = require('../config/db')

// Get all uploaded documents
const getDocuments = async (req, res) => {
  try {
    const [documents] = await db.execute(
      `SELECT
        id,
        document_name AS name,
        stored_filename AS filename,
        file_size AS size,
        mime_type AS mimetype,
        status,
        document_type AS documentType,
        extracted_data AS extractedData,
        uploaded_at AS uploadedAt
       FROM documents
       ORDER BY uploaded_at DESC`
    )

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
const removeDocument = async (req, res) => {
  try {
    const { id } = req.params

    const [documents] = await db.execute(
      'SELECT stored_filename FROM documents WHERE id = ?',
      [id]
    )

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      })
    }

    const filePath = path.join(
      __dirname,
      '../../uploads',
      documents[0].stored_filename
    )

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await db.execute('DELETE FROM documents WHERE id = ?', [id])

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
