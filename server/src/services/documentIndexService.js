
const db = require('../config/db')
const chunkText = require('../utils/textChunker')
const generateEmbedding = require('./embeddingService')

const EMBEDDING_MODEL = 'gemini-embedding-001'

const indexDocument = async (documentId) => {
  const [documents] = await db.execute(
    'SELECT id, extracted_text FROM documents WHERE id = ?',
    [documentId]
  )

  if (documents.length === 0) {
    throw new Error('Document not found')
  }

  const document = documents[0]

  if (!document.extracted_text || !document.extracted_text.trim()) {
    throw new Error('Document has no extracted text')
  }

  const chunks = chunkText(document.extracted_text)

  if (chunks.length === 0) {
    throw new Error('No valid text chunks generated')
  }

  // Generate embeddings before changing existing indexed data.
  const indexedChunks = []

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i])

    indexedChunks.push({
      index: i,
      text: chunks[i],
      embedding: JSON.stringify(embedding),
    })
  }

  // Replace existing chunks only after all embeddings succeed.
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    await connection.execute(
      'DELETE FROM document_chunks WHERE document_id = ?',
      [documentId]
    )

    for (const chunk of indexedChunks) {
      await connection.execute(
        `INSERT INTO document_chunks
         (document_id, chunk_index, chunk_text, embedding, embedding_model)
         VALUES (?, ?, ?, ?, ?)`,
        [
          documentId,
          chunk.index,
          chunk.text,
          chunk.embedding,
          EMBEDDING_MODEL,
        ]
      )
    }

    await connection.commit()

    return {
      documentId,
      totalChunks: indexedChunks.length,
      message: 'Document indexed successfully',
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = indexDocument
