const express = require('express');
const router = express.Router();
const seedDatabase = require('../utils/seedData');

router.post('/reset', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database reset and seeded with curated FloSet collection!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
