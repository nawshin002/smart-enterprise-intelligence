
const express = require('express')
const router = express.Router()

const {
  startApproval,
  getApprovals,
  updateApproval,
  getApprovalLogs,
} = require('../controllers/approvalController')

// Start approval for a document
router.post('/start', startApproval)

// Get all approval workflows
router.get('/', getApprovals)

// Approve or reject a workflow
router.put('/:id', updateApproval)

// Get approval audit logs
router.get('/logs', getApprovalLogs)

module.exports = router
