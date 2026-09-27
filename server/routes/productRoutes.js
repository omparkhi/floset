const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  checkAvailability,
  listOutfit,
  getHostListings,
  updateHostListing,
  deleteHostListing
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/host/my-listings', protect, getHostListings);
router.put('/host/:id', protect, updateHostListing);
router.delete('/host/:id', protect, deleteHostListing);
router.get('/:id/availability', checkAvailability);
router.get('/:id', getProductById);
router.post('/list-outfit', protect, listOutfit);

module.exports = router;
