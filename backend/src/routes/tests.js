const express = require('express');
const router = express.Router();

// Basic tests route for now
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Tests route working' });
});

module.exports = router; 