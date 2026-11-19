
const askDocumentQuestion = require('../services/ragService')

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid question.',
      })
    }

    const result = await askDocumentQuestion(question.trim())

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('RAG Controller Error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to process your question. Please try again.',
    })
  }
}

module.exports = { askQuestion }
