const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide outfit name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide description']
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Dresses',
        'Gowns',
        'Sarees',
        'Lehengas',
        'Indo-Western',
        'Sherwanis',
        'Kurta Sets',
        'Suits',
        'Blazers'
      ],
      index: true
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
      index: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['Women', 'Men', 'Unisex'],
      index: true
    },
    occasions: {
      type: [String],
      enum: [
        'Wedding',
        'Reception',
        'Party',
        'Birthday',
        'Date',
        'Photoshoot',
        'College Event'
      ],
      default: ['Party']
    },
    images: {
      type: [String],
      validate: [val => val.length > 0, 'Must have at least one image']
    },
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
    },
    availableSizes: {
      type: [String],
      default: []
    },
    measurements: {
      bustChest: { type: String, default: '' },
      waist: { type: String, default: '' },
      hips: { type: String, default: '' },
      length: { type: String, default: '' },
      fitNotes: { type: String, default: '' }
    },
    colour: {
      type: String,
      required: true,
      trim: true
    },
    condition: {
      type: String,
      enum: ['Brand New with Tags', 'Like New', 'Gently Used'],
      default: 'Like New'
    },
    includedAccessories: {
      type: [String],
      default: []
    },
    cleaningInfo: {
      type: String,
      default: 'Professionally dry-cleaned, UV-sanitized, and steam-pressed before every rental.'
    },
    brand: {
      type: String,
      default: 'FLOSET Curation'
    },
    pricing: {
      duration3h: { type: Number, required: true },
      duration1d: { type: Number, required: true },
      duration3d: { type: Number, required: true },
      duration5d: { type: Number, required: true },
      duration7d: { type: Number, required: true }
    },
    securityDeposit: {
      type: Number,
      required: true,
      default: 1000
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING_REVIEW', 'REJECTED', 'INACTIVE'],
      default: 'APPROVED',
      index: true
    },
    rating: {
      type: Number,
      default: 4.9
    },
    reviewsCount: {
      type: Number,
      default: 12
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    badge: {
      type: String,
      default: 'New'
    },

    // INTERNAL MARKETPLACE FIELDS (STRICTLY ADMIN/HOST ONLY)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    sourceType: {
      type: String,
      enum: ['FLOSET', 'INDIVIDUAL', 'STORE', 'DESIGNER'],
      default: 'FLOSET'
    },
    /** Host-declared blackout / unavailable windows (admin may override) */
    hostAvailabilityBlocks: [
      {
        startDate: Date,
        endDate: Date,
        note: { type: String, default: '' }
      }
    ],
    ownerExpectedEarning: {
      type: Number,
      default: 0
    },
    ownerRentalDurationPreference: {
      type: String,
      default: '3_days'
    },
    additionalDayCharge: {
      type: Number,
      default: 200
    },
    ownerPickupAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      contactPhone: String,
      contactName: String
    },
    adminReviewNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Method to safely sanitize product for customer responses
productSchema.methods.toCustomerJSON = function () {
  const obj = this.toObject();
  delete obj.ownerId;
  delete obj.sourceType;
  delete obj.ownerExpectedEarning;
  delete obj.ownerRentalDurationPreference;
  delete obj.additionalDayCharge;
  delete obj.ownerPickupAddress;
  delete obj.adminReviewNotes;
  return obj;
};

module.exports = mongoose.model('Product', productSchema);
