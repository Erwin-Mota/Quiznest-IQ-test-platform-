const express = require('express');
const router = express.Router();

// Basic questions route for now
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Questions route working' });
});

module.exports = router; 