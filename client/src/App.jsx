
import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${API_URL}/documents`)

        if (!response.ok) {
          throw new Error('Failed to fetch documents')
        }

        const result = await response.json()
        setDocuments(result.data)
      } catch (err) {
        setError('Unable to connect to the DocuMind backend.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  // Upload a PDF document
  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      event.target.value = ''
      return
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      alert('File size must be less than 10 MB.')
      event.target.value = ''
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('document', file)

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed')
      }

      setDocuments((prevDocuments) => [
        ...prevDocuments,
        result.data,
      ])

      alert('Document uploaded and processed successfully!')
    } catch (err) {
      setError(err.message || 'Unable to upload document.')
      console.error(err)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  // Delete document from backend
  const handleRemoveDocument = async (id) => {
    setDeletingId(id)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/documents/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete document')
      }

      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc.id !== id)
      )
    } catch (err) {
      setError(err.message || 'Unable to delete document.')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="app">
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

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

      <main className="main-content">
        <header>
          <h1>Dashboard</h1>
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : '+ Upload Document'}
          </button>
        </header>

        <section className="welcome">
          <h2>Welcome to DocuMind</h2>
          <p>
            Manage, process and analyze your enterprise documents
            from one place.
          </p>
        </section>

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

        <section className="documents">
          <h2>Recent Documents</h2>

          {error && <p>{error}</p>}

          {loading ? (
            <p>Loading documents...</p>
          ) : documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <div className="document-list">
              {documents.map((doc) => {
                const resumeData =
                  typeof doc.extractedData === 'string'
                    ? JSON.parse(doc.extractedData)
                    : doc.extractedData

                return (
                  <div className="document-item" key={doc.id}>
                    <div className="document-info">
                      <span className="pdf-icon">PDF</span>

                      <div>
                        <h3>{doc.name}</h3>
                        <p>{doc.size} KB</p>
                        <p>
                          Document Type: {doc.documentType || 'General Document'}
                        </p>

                        {doc.documentType === 'Resume' && resumeData && (
                          <div className="resume-details">
                            <p>
                              <strong>Email:</strong>{' '}
                              {resumeData.email || 'Not found'}
                            </p>

                            <p>
                              <strong>Phone:</strong>{' '}
                              {resumeData.phone || 'Not found'}
                            </p>

                            <p>
                              <strong>Skills:</strong>{' '}
                              {resumeData.skills?.length
                                ? resumeData.skills.join(', ')
                                : 'No skills detected'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="document-actions">
                      <span>{doc.status}</span>

                      <button
                        className="remove-button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
