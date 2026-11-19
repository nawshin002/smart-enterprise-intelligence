
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 5000

const documentRoutes = require('./src/routes/documentRoutes')
const uploadRoutes = require('./src/routes/uploadRoutes')
const approvalRoutes = require('./src/routes/approvalRoutes')

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/documents', documentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/approvals', approvalRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DocuMind server is running!',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
