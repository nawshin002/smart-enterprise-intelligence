
const fs = require('fs')
const db = require('../config/db')
const extractPdfText = require('../utils/pdfExtractor')
const classifyDocument = require('../utils/documentClassifier')
const extractResumeData = require('../utils/resumeExtractor')
const generateFileHash = require('../utils/fileHash')
const indexDocument = require('../services/documentIndexService')

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF document.',
      })
    }

    // Generate SHA-256 hash
    const fileHash = generateFileHash(req.file.path)

    // Check for duplicate documents
    const [existingDocuments] = await db.execute(
      'SELECT id FROM documents WHERE file_hash = ?',
      [fileHash]
    )

    if (existingDocuments.length > 0) {
      fs.unlinkSync(req.file.path)

      return res.status(409).json({
        success: false,
        message: 'This document has already been uploaded.',
      })
    }

    // Extract text from PDF
    const extractedText = await extractPdfText(req.file.path)

    // Validate extracted content
    if (!extractedText || !extractedText.trim()) {
      fs.unlinkSync(req.file.path)

      return res.status(400).json({
        success: false,
        message: 'The uploaded PDF contains no readable text.',
      })
    }

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
        extracted_text, document_type, extracted_data, file_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newDocument.name,
        newDocument.filename,
        newDocument.size,
        newDocument.mimetype,
        newDocument.status,
        extractedText,
        documentType,
        extractedData ? JSON.stringify(extractedData) : null,
        fileHash,
      ]
    )

    newDocument.id = result.insertId
    newDocument.uploadedAt = new Date().toISOString()

    // Automatically index the document for RAG
    let indexing = {
      success: false,
      message: 'Document indexing failed.',
    }

    try {
      await indexDocument(newDocument.id)

      indexing = {
        success: true,
        message: 'Document indexed successfully for AI search.',
      }
    } catch (indexError) {
      console.error('Document indexing error:', indexError)

      indexing = {
        success: false,
        message: 'Document uploaded, but AI indexing failed. Please check the backend logs.',
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully!',
      indexing,
      data: {
        ...newDocument,
        extractedText,
        documentType,
        extractedData,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)

    return res.status(500).json({
      success: false,
      message: 'Document processing failed.',
    })
  }
}

module.exports = {
  uploadDocument,
}
