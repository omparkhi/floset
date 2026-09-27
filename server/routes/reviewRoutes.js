const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProductReviews, createReview } = require('../controllers/reviewController');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);

module.exports = router;
