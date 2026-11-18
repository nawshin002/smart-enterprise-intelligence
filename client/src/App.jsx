
import './App.css'

function App() {
  return (
    <div className="app">
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
          <button>+ Upload Document</button>
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
            <p>0</p>
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
          <p>No documents uploaded yet.</p>
        </section>
      </main>
    </div>
  )
}

export default App
