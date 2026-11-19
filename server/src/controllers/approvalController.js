
const db = require('../config/db')

// Start approval workflow for a document
const startApproval = async (req, res) => {
  try {
    const { documentId } = req.body

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required.',
      })
    }

    const [documents] = await db.execute(
      'SELECT id FROM documents WHERE id = ?',
      [documentId]
    )

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      })
    }

    const [existing] = await db.execute(
      'SELECT id FROM approval_workflows WHERE document_id = ?',
      [documentId]
    )

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An approval workflow already exists for this document.',
      })
    }

    const [result] = await db.execute(
      `INSERT INTO approval_workflows
       (document_id, current_department, assigned_role, status, approval_step)
       VALUES (?, 'Finance', 'Finance Officer', 'Pending', 1)`,
      [documentId]
    )

    await db.execute(
      `UPDATE documents SET status = 'Pending Approval' WHERE id = ?`,
      [documentId]
    )

    res.status(201).json({
      success: true,
      message: 'Document sent for approval successfully!',
      workflowId: result.insertId,
    })
  } catch (error) {
    console.error('Start approval error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to start approval workflow.',
    })
  }
}

// Get all approval workflows
const getApprovals = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         aw.id AS workflowId,
         aw.document_id AS documentId,
         d.document_name AS documentName,
         aw.current_department AS currentDepartment,
         aw.assigned_role AS assignedRole,
         aw.approval_step AS approvalStep,
         aw.status,
         aw.created_at AS createdAt
       FROM approval_workflows aw
       JOIN documents d ON aw.document_id = d.id
       ORDER BY aw.created_at DESC`
    )

    res.status(200).json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Get approvals error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch approval workflows.',
    })
  }
}

// Approve or reject a workflow
const updateApproval = async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()

    const { id } = req.params
    const { userId, action, comments } = req.body

    if (!userId || !['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID and action are required.',
      })
    }

    await connection.beginTransaction()

    const [workflows] = await connection.execute(
      'SELECT * FROM approval_workflows WHERE id = ? FOR UPDATE',
      [id]
    )

    if (workflows.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: 'Approval workflow not found.',
      })
    }

    const workflow = workflows[0]

    if (workflow.status !== 'Pending') {
      await connection.rollback()
      return res.status(409).json({
        success: false,
        message: 'This workflow has already been completed.',
      })
    }

    const [users] = await connection.execute(
      'SELECT id, department, role FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const user = users[0]

    if (
      user.department !== workflow.current_department ||
      user.role !== workflow.assigned_role
    ) {
      await connection.rollback()
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to review this document.',
      })
    }

    await connection.execute(
      `INSERT INTO approval_logs
       (workflow_id, user_id, action, comments)
       VALUES (?, ?, ?, ?)`,
      [id, userId, action, comments || null]
    )

    if (action === 'Rejected') {
      await connection.execute(
        `UPDATE approval_workflows
         SET status = 'Rejected' WHERE id = ?`,
        [id]
      )

      await connection.execute(
        `UPDATE documents SET status = 'Rejected' WHERE id = ?`,
        [workflow.document_id]
      )
    } else if (workflow.approval_step === 1) {
      await connection.execute(
        `UPDATE approval_workflows
         SET current_department = 'IT',
             assigned_role = 'Department Manager',
             approval_step = 2
         WHERE id = ?`,
        [id]
      )
    } else if (workflow.approval_step === 2) {
      await connection.execute(
        `UPDATE approval_workflows
         SET current_department = 'Management',
             assigned_role = 'Final Approver',
             approval_step = 3
         WHERE id = ?`,
        [id]
      )
    } else {
      await connection.execute(
        `UPDATE approval_workflows
         SET status = 'Approved' WHERE id = ?`,
        [id]
      )

      await connection.execute(
        `UPDATE documents SET status = 'Approved' WHERE id = ?`,
        [workflow.document_id]
      )
    }

    await connection.commit()

    res.status(200).json({
      success: true,
      message:
        action === 'Rejected'
          ? 'Document rejected successfully!'
          : workflow.approval_step < 3
            ? 'Approval recorded. Document moved to the next stage.'
            : 'Document fully approved!',
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    console.error('Update approval error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to update approval.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// Get audit logs
const getApprovalLogs = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         al.id,
         al.workflow_id AS workflowId,
         d.document_name AS documentName,
         u.name AS employeeName,
         u.department,
         al.action,
         al.comments,
         al.created_at AS createdAt
       FROM approval_logs al
       JOIN approval_workflows aw ON al.workflow_id = aw.id
       JOIN documents d ON aw.document_id = d.id
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC`
    )

    res.status(200).json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Audit logs error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch audit logs.',
    })
  }
}

module.exports = {
  startApproval,
  getApprovals,
  updateApproval,
  getApprovalLogs,
}
