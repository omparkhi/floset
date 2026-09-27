const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { submitContact, getContactMessages } = require('../controllers/contactController');

router.post('/', submitContact);
router.get('/', protect, authorize('admin'), getContactMessages);

module.exports = router;
