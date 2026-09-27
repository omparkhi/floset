const express = require('express');
const router = express.Router();
const {
  getPendingListings,
  approveListing,
  rejectListing,
  getAllProducts,
  updateProduct,
  getAllBookings,
  updateBookingStatus,
  getAdminStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/listings/pending', getPendingListings);
router.put('/listings/:id/approve', approveListing);
router.put('/listings/:id/reject', rejectListing);
router.get('/products', getAllProducts);
router.put('/products/:id', updateProduct);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

module.exports = router;
