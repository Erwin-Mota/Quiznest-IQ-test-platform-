const express = require('express');
const router = express.Router();

// Basic users route for now
router.get('/profile', (req, res) => {
  res.json({ success: true, message: 'Users route working' });
});

module.exports = router; 