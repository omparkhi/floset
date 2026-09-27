const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['customer', 'host', 'admin', 'shopkeeper'],
      default: 'customer'
    },
    /** Customer can also host — set when registering as host or after first listing */
    isHost: {
      type: Boolean,
      default: false
    },
    wishlistProductIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    hostDetails: {
      type: {
        type: String,
        enum: ['INDIVIDUAL', 'STORE', 'DESIGNER'],
        default: 'INDIVIDUAL'
      },
      businessName: { type: String, default: '' },
      payoutUpi: { type: String, default: '' },
      payoutBankDetails: {
        accountNumber: { type: String, default: '' },
        ifsc: { type: String, default: '' },
        bankName: { type: String, default: '' }
      },
      verified: { type: Boolean, default: false }
    },
    savedAddresses: [
      {
        street: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
