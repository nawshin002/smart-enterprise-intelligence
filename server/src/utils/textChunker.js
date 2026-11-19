
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  if (!text || typeof text !== 'string') {
    return []
  }

  const cleanedText = text.replace(/\s+/g, ' ').trim()

  if (!cleanedText) {
    return []
  }

  if (overlap >= chunkSize) {
    throw new Error('Overlap must be smaller than chunk size')
  }

  const chunks = []
  const step = chunkSize - overlap

  for (let start = 0; start < cleanedText.length; start += step) {
    const chunk = cleanedText.slice(start, start + chunkSize).trim()

    if (chunk) {
      chunks.push(chunk)
    }
  }

  return chunks
}

module.exports = chunkText
