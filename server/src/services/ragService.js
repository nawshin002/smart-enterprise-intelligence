
const retrieveRelevantChunks = require('./retrievalService')
const generateAnswer = require('./answerService')

const askDocumentQuestion = async (question) => {
  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new Error('Please provide a valid question')
  }

  // Retrieve the five most relevant document passages.
  const retrievedChunks = await retrieveRelevantChunks(
    question.trim(),
    5
  )

  // Generate an answer using only the retrieved passages.
  const answer = await generateAnswer(
    question.trim(),
    retrievedChunks
  )

  // Collect unique source documents.
  const sources = [
    ...new Map(
      retrievedChunks.map(chunk => [
        chunk.documentId,
        {
          documentId: chunk.documentId,
          documentName: chunk.documentName,
          documentType: chunk.documentType,
        },
      ])
    ).values(),
  ]

  return {
    question: question.trim(),
    answer,
    sources,
    retrievedChunks: retrievedChunks.length,
  }
}

module.exports = askDocumentQuestion
