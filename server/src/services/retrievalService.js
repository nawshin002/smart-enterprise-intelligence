
const db = require('../config/db')
const generateEmbedding = require('./embeddingService')

const cosineSimilarity = (vectorA, vectorB) => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Embedding dimensions do not match')
  }

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i]
    magnitudeA += vectorA[i] * vectorA[i]
    magnitudeB += vectorB[i] * vectorB[i]
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
}

const retrieveRelevantChunks = async (question, limit = 5) => {
  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new Error('A valid question is required')
  }

  const questionEmbedding = await generateEmbedding(question.trim())

  const [rows] = await db.execute(
    `SELECT
       dc.document_id,
       dc.chunk_index,
       dc.chunk_text,
       dc.embedding,
       d.document_name,
       d.document_type
     FROM document_chunks dc
     JOIN documents d ON dc.document_id = d.id`
  )

  if (rows.length === 0) {
    throw new Error('No indexed documents found')
  }

  const results = rows.map(row => {
    const storedEmbedding =
      typeof row.embedding === 'string'
        ? JSON.parse(row.embedding)
        : row.embedding

    return {
      documentId: row.document_id,
      documentName: row.document_name,
      documentType: row.document_type,
      chunkIndex: row.chunk_index,
      text: row.chunk_text,
      score: cosineSimilarity(questionEmbedding, storedEmbedding),
    }
  })

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

module.exports = retrieveRelevantChunks
