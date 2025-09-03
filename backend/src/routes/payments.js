const express = require('express');
const router = express.Router();

// Basic payments route for now
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Payments route working' });
});

module.exports = router; 