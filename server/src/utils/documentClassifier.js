
const classifyDocument = (text) => {
  const content = text.toLowerCase()

  // Resume detection gets priority
  if (
    content.includes('curriculum vitae') ||
    content.includes('professional experience') ||
    content.includes('work experience') ||
    content.includes('education') && content.includes('skills') ||
    content.includes('resume')
  ) {
    return 'Resume'
  }

  // Invoice detection
  if (
    content.includes('invoice number') ||
    content.includes('amount due') ||
    content.includes('bill to') ||
    content.includes('invoice date')
  ) {
    return 'Invoice'
  }

  // Certificate detection
  if (
    content.includes('this is to certify') ||
    content.includes('certificate of completion') ||
    content.includes('has successfully completed') ||
    content.includes('is hereby awarded')
  ) {
    return 'Certificate'
  }

  return 'General Document'
}

module.exports = classifyDocument
