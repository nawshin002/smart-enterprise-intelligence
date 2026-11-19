
const db = require('../config/db')
const extractPdfText = require('../utils/pdfExtractor')
const classifyDocument = require('../utils/documentClassifier')
const extractResumeData = require('../utils/resumeExtractor')

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF document.',
      })
    }

    // Extract text from PDF
    const extractedText = await extractPdfText(req.file.path)

    // Classify document
    const documentType = classifyDocument(extractedText)

    // Extract structured information from resumes
    let extractedData = null

    if (documentType === 'Resume') {
      extractedData = extractResumeData(extractedText)
    }

    const newDocument = {
      name: req.file.originalname,
      size: (req.file.size / 1024).toFixed(2),
      mimetype: req.file.mimetype,
      filename: req.file.filename,
      status: 'Uploaded',
    }

    // Save document and extracted information in MySQL
    const [result] = await db.execute(
      `INSERT INTO documents
       (document_name, stored_filename, file_size, mime_type, status,
        extracted_text, document_type, extracted_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newDocument.name,
        newDocument.filename,
        newDocument.size,
        newDocument.mimetype,
        newDocument.status,
        extractedText,
        documentType,
        extractedData ? JSON.stringify(extractedData) : null,
      ]
    )

    newDocument.id = result.insertId
    newDocument.uploadedAt = new Date().toISOString()

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully!',
      data: {
        ...newDocument,
        extractedText,
        documentType,
        extractedData,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)

    res.status(500).json({
      success: false,
      message: 'Document processing failed.',
    })
  }
}

module.exports = {
  uploadDocument,
}
