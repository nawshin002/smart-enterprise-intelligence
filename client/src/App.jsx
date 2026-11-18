
import { useState, useRef } from 'react'
import './App.css'

function App() {
  // State variables
  const [documents, setDocuments] = useState([])
  const fileInputRef = useRef(null)

  // Handle PDF upload
  const handleFileChange = (event) => {
    const file = event.target.files[0]

    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      event.target.value = ''
      return
    }

    // Validate file size (10 MB maximum)
    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      alert('File size must be less than 10 MB.')
      event.target.value = ''
      return
    }

    // Create document object
    const newDocument = {
      id: Date.now(),
      name: file.name,
      size: (file.size / 1024).toFixed(2),
      status: 'Uploaded',
    }

    setDocuments((prevDocuments) => [
      ...prevDocuments,
      newDocument,
    ])

    event.target.value = ''
  }

  // Remove document
  const handleRemoveDocument = (id) => {
    setDocuments((prevDocuments) =>
      prevDocuments.filter((doc) => doc.id !== id)
    )
  }

  return (
    <div className="app">

      {/* Hidden PDF input */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>DocuMind</h2>

        <nav>
          <p>Dashboard</p>
          <p>Documents</p>
          <p>Approvals</p>
          <p>AI Assistant</p>
          <p>Audit Logs</p>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">

        {/* Header */}
        <header>
          <h1>Dashboard</h1>

          <button
            onClick={() => fileInputRef.current.click()}
          >
            + Upload Document
          </button>
        </header>

        {/* Welcome section */}
        <section className="welcome">
          <h2>Welcome to DocuMind</h2>

          <p>
            Manage, process and analyze your enterprise documents
            from one place.
          </p>
        </section>

        {/* Statistics */}
        <section className="stats">

          <div className="stat-card">
            <h3>Total Documents</h3>
            <p>{documents.length}</p>
          </div>

          <div className="stat-card">
            <h3>Pending Approvals</h3>
            <p>0</p>
          </div>

          <div className="stat-card">
            <h3>Processed Documents</h3>
            <p>0</p>
          </div>

        </section>

        {/* Recent documents */}
        <section className="documents">
          <h2>Recent Documents</h2>

          {documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <div className="document-list">

              {documents.map((doc) => (
                <div
                  className="document-item"
                  key={doc.id}
                >

                  {/* Document information */}
                  <div className="document-info">
                    <span className="pdf-icon">PDF</span>

                    <div>
                      <h3>{doc.name}</h3>
                      <p>{doc.size} KB</p>
                    </div>
                  </div>

                  {/* Document actions */}
                  <div className="document-actions">
                    <span>{doc.status}</span>

                    <button
                      className="remove-button"
                      onClick={() => handleRemoveDocument(doc.id)}
                    >
                      Remove
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}
        </section>

      </main>
    </div>
  )
}

export default App
