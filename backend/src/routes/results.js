const express = require('express');
const router = express.Router();

// Basic results route for now
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Results route working' });
});

module.exports = router; 