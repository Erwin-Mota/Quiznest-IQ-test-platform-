const express = require('express');
const router = express.Router();

// Basic admin route for now
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Admin route working' });
});

module.exports = router; 