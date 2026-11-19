
const ai = require('../config/gemini')

const generateEmbedding = async (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Valid text is required to generate an embedding')
  }

  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  })

  const embedding = response.embeddings?.[0]?.values

  if (!embedding || embedding.length === 0) {
    throw new Error('Failed to generate document embedding')
  }

  return embedding
}

module.exports = generateEmbedding
