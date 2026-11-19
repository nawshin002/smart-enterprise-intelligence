
import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

const DEMO_USERS = [
  { id: 1, name: 'Rahul Sharma', department: 'Finance', role: 'Finance Officer' },
  { id: 2, name: 'Priya Das', department: 'HR', role: 'HR Manager' },
  { id: 3, name: 'Amit Verma', department: 'IT', role: 'Department Manager' },
  { id: 4, name: 'Sneha Roy', department: 'Management', role: 'Final Approver' },
]

function getStatusClass(status) {
  switch (status) {
    case 'Approved':
      return 'status-approved'
    case 'Rejected':
      return 'status-rejected'
    case 'Pending':
    case 'Pending Approval':
      return 'status-pending'
    default:
      return 'status-uploaded'
  }
}

function App() {
  const [documents, setDocuments] = useState([])
  const [approvals, setApprovals] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('Dashboard')
  const [currentUserId, setCurrentUserId] = useState(1)

  const fileInputRef = useRef(null)

  const currentUser = DEMO_USERS.find(
    (user) => user.id === Number(currentUserId)
  )

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [documentsResponse, approvalsResponse, logsResponse] =
        await Promise.all([
          fetch(`${API_URL}/documents`),
          fetch(`${API_URL}/approvals`),
          fetch(`${API_URL}/approvals/logs`),
        ])

      const documentsResult = await documentsResponse.json()
      const approvalsResult = await approvalsResponse.json()
      const logsResult = await logsResponse.json()

      if (!documentsResponse.ok || !documentsResult.success) {
        throw new Error('Unable to fetch documents.')
      }

      if (!approvalsResponse.ok || !approvalsResult.success) {
        throw new Error('Unable to fetch approvals.')
      }

      if (!logsResponse.ok || !logsResult.success) {
        throw new Error('Unable to fetch audit logs.')
      }

      setDocuments(documentsResult.data || [])
      setApprovals(approvalsResult.data || [])
      setAuditLogs(logsResult.data || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to connect to DocuMind backend.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Upload PDF document
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

      await fetchDashboardData()
      alert('Document uploaded and processed successfully!')
    } catch (err) {
      setError(err.message || 'Unable to upload document.')
      console.error(err)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  // Delete document
  const handleRemoveDocument = async (id) => {
    if (!window.confirm('Are you sure you want to remove this document?')) {
      return
    }

    setDeletingId(id)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/documents/${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete document')
      }

      await fetchDashboardData()
    } catch (err) {
      setError(err.message || 'Unable to delete document.')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // Start approval workflow
  const handleStartApproval = async (documentId) => {
    setProcessingId(documentId)
    setError('')

    try {
      const response = await fetch(`${API_URL}/approvals/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to start approval.')
      }

      await fetchDashboardData()
      alert('Document successfully sent for approval!')
    } catch (err) {
      setError(err.message || 'Unable to start approval.')
    } finally {
      setProcessingId(null)
    }
  }

  // Approve or reject document
  const handleApprovalAction = async (workflowId, action) => {
    const comments = window.prompt(
      `Enter comments for this ${action.toLowerCase()} decision:`
    )

    if (comments === null) return

    setProcessingId(workflowId)
    setError('')

    try {
      const response = await fetch(`${API_URL}/approvals/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          action,
          comments,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to update approval.')
      }

      await fetchDashboardData()
      alert(result.message)
    } catch (err) {
      setError(err.message || 'Unable to update approval.')
    } finally {
      setProcessingId(null)
    }
  }

  const pendingCount = approvals.filter(
    (approval) => approval.status === 'Pending'
  ).length

  const approvedCount = documents.filter(
    (doc) => doc.status === 'Approved'
  ).length

  const rejectedCount = documents.filter(
    (doc) => doc.status === 'Rejected'
  ).length

  const getDocumentData = (doc) => {
    try {
      return typeof doc.extractedData === 'string'
        ? JSON.parse(doc.extractedData)
        : doc.extractedData
    } catch {
      return null
    }
  }

  const navigationItems = [
    'Dashboard',
    'Documents',
    'Approvals',
    'AI Assistant',
    'Audit Logs',
  ]

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
          {navigationItems.map((item) => (
            <button
              key={item}
              className={`nav-link ${
                activeSection === item ? 'active' : ''
              }`}
              onClick={() => setActiveSection(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <p>Demo User</p>
          <strong>{currentUser.name}</strong>
          <small>{currentUser.department}</small>
        </div>
      </aside>

      <main className="main-content">
        <header>
          <h1>{activeSection}</h1>

          <div className="header-actions">
            <select
              value={currentUserId}
              onChange={(event) => setCurrentUserId(Number(event.target.value))}
              aria-label="Select demo user"
            >
              {DEMO_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} — {user.role}
                </option>
              ))}
            </select>

            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : '+ Upload Document'}
            </button>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading DocuMind...</p>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeSection === 'Dashboard' && (
              <>
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
                    <p>{pendingCount}</p>
                  </div>

                  <div className="stat-card">
                    <h3>Approved Documents</h3>
                    <p>{approvedCount}</p>
                  </div>
                </section>

                <section className="documents">
                  <h2>Recent Documents</h2>

                  {documents.length === 0 ? (
                    <p>No documents uploaded yet.</p>
                  ) : (
                    <div className="document-list">
                      {documents.slice(0, 5).map((doc) => (
                        <div className="document-item" key={doc.id}>
                          <div className="document-info">
                            <span className="pdf-icon">PDF</span>
                            <div>
                              <h3>{doc.name}</h3>
                              <p>{doc.documentType || 'General Document'}</p>
                            </div>
                          </div>

                          <div className="document-actions">
                            <span className={`status-badge ${getStatusClass(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* DOCUMENTS */}
            {activeSection === 'Documents' && (
              <section className="documents">
                <h2>Document Management</h2>

                {documents.length === 0 ? (
                  <p>No documents uploaded yet.</p>
                ) : (
                  <div className="document-list">
                    {documents.map((doc) => {
                      const resumeData = getDocumentData(doc)

                      const existingWorkflow = approvals.find(
                        (approval) => approval.documentId === doc.id
                      )

                      return (
                        <div className="document-item" key={doc.id}>
                          <div className="document-info">
                            <span className="pdf-icon">PDF</span>

                            <div>
                              <h3>{doc.name}</h3>
                              <p>{doc.size} KB</p>
                              <p>
                                Document Type:{' '}
                                {doc.documentType || 'General Document'}
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

                              {existingWorkflow && (
                                <p>
                                  Approval stage: {existingWorkflow.approvalStep} of 3
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="document-actions">
                            <span className={`status-badge ${getStatusClass(doc.status)}`}>
                              {doc.status}
                            </span>

                            {!existingWorkflow && (
                              <button
                                onClick={() => handleStartApproval(doc.id)}
                                disabled={processingId === doc.id}
                              >
                                {processingId === doc.id
                                  ? 'Sending...'
                                  : 'Send for Approval'}
                              </button>
                            )}

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
            )}

            {/* APPROVALS */}
            {activeSection === 'Approvals' && (
              <section className="documents">
                <h2>Departmental Approval Workflows</h2>

                <p>
                  Signed in as: <strong>{currentUser.name}</strong>
                  {' — '}{currentUser.role}
                </p>

                {approvals.length === 0 ? (
                  <p>No approval workflows available.</p>
                ) : (
                  <div className="document-list">
                    {approvals.map((approval) => {
                      const isAssignedApprover =
                        approval.currentDepartment === currentUser.department &&
                        approval.assignedRole === currentUser.role

                      return (
                        <div className="document-item" key={approval.workflowId}>
                          <div className="document-info">
                            <span className="pdf-icon">PDF</span>

                            <div>
                              <h3>{approval.documentName}</h3>
                              <p>Workflow ID: {approval.workflowId}</p>
                              <p>
                                Current Department: {approval.currentDepartment}
                              </p>
                              <p>Assigned Role: {approval.assignedRole}</p>
                              <p>Approval Stage: {approval.approvalStep} of 3</p>
                            </div>
                          </div>

                          <div className="document-actions">
                            <span className={`status-badge ${getStatusClass(approval.status)}`}>
                              {approval.status}
                            </span>

                            {approval.status === 'Pending' && isAssignedApprover && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApprovalAction(
                                      approval.workflowId,
                                      'Approved'
                                    )
                                  }
                                  disabled={processingId === approval.workflowId}
                                >
                                  {processingId === approval.workflowId
                                    ? 'Processing...'
                                    : 'Approve'}
                                </button>

                                <button
                                  className="remove-button"
                                  onClick={() =>
                                    handleApprovalAction(
                                      approval.workflowId,
                                      'Rejected'
                                    )
                                  }
                                  disabled={processingId === approval.workflowId}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {approval.status === 'Pending' && !isAssignedApprover && (
                              <small>
                                Awaiting {approval.assignedRole}
                              </small>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {/* AUDIT LOGS */}
            {activeSection === 'Audit Logs' && (
              <section className="documents">
                <h2>Document Approval History</h2>

                {auditLogs.length === 0 ? (
                  <p>No audit records available.</p>
                ) : (
                  <div className="document-list">
                    {auditLogs.map((log) => (
                      <div className="document-item" key={log.id}>
                        <div className="document-info">
                          <span className="pdf-icon">LOG</span>

                          <div>
                            <h3>{log.documentName}</h3>
                            <p>Employee: {log.employeeName}</p>
                            <p>Department: {log.department}</p>
                            <p>Action: {log.action}</p>
                            <p>Comments: {log.comments || 'No comments'}</p>
                            <p>
                              Date: {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="document-actions">
                          <span className={`status-badge ${getStatusClass(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* AI ASSISTANT */}
            {activeSection === 'AI Assistant' && (
              <section className="documents">
                <h2>DocuMind AI Assistant</h2>
                <p>
                  The AI Assistant interface will be implemented in CP08.
                </p>
                <p>
                  It will help users search and understand their enterprise
                  documents.
                </p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
