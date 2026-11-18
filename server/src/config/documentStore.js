
const fs = require('fs')
const path = require('path')

const dataFile = path.join(__dirname, '../../data/documents.json')

// Read all documents
const getAllDocuments = () => {
  const fileData = fs.readFileSync(dataFile, 'utf8')
  return JSON.parse(fileData || '[]')
}

// Save all documents
const saveAllDocuments = (documents) => {
  fs.writeFileSync(
    dataFile,
    JSON.stringify(documents, null, 2)
  )
}

// Add a document
const addDocument = (document) => {
  const documents = getAllDocuments()
  documents.push(document)
  saveAllDocuments(documents)
  return document
}

// Delete a document
const deleteDocument = (id) => {
  const documents = getAllDocuments()
  const updatedDocuments = documents.filter(
    (document) => document.id !== id
  )

  if (updatedDocuments.length === documents.length) {
    return false
  }

  saveAllDocuments(updatedDocuments)
  return true
}

module.exports = {
  getAllDocuments,
  addDocument,
  deleteDocument,
}
