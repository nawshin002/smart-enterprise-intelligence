
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 5000

// Import routes
const documentRoutes = require('./src/routes/documentRoutes')
const uploadRoutes = require('./src/routes/uploadRoutes')

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/documents', documentRoutes)
app.use('/api/upload', uploadRoutes)

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DocuMind backend is running successfully!',
  })
})

// Start Server
app.listen(PORT, () => {
  console.log(`DocuMind server running on http://localhost:${PORT}`)
})
