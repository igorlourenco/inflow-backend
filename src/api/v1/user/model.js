const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../../config');

/**
 * User Schema
 * @private
 */

const userSchema = new mongoose.Schema({
  access_token: { type: String },
  account_type: {
    default: 'user',
    enum: ['user', 'artist'],
    type: String,
  },
  tokensbought: { type: [String] },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  created_at: {
    default: Date.now,
    type: Number,
  },
  currency: { type: String },
  email: { type: String },
  email_verified: {
    default: false,
    type: Boolean,
  },
  firebase_user_id: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  name: { type: String },
  password: { type: String },
  phone: { type: String },
  pin_code: { type: String },
  profile_image: {
    type: String, default: '',
  },
  banner_image: {
    type: String, default: '',
  },
  refresh_token: { type: String },
  status: {
    default: 'active',
    enum: ['active', 'blocked', 'deleted', 'pending'],
    type: String,
  },
  updated_at: {
    default: Date.now,
    type: Number,
  },
  wallet_id: {
    default: null,
    type: String,
  },
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre('save', async function save(next) {
  try {
    // eslint-disable-next-line no-invalid-this
    if (!this.isModified('password')) return next();

    const rounds = 10;

    // eslint-disable-next-line no-invalid-this
    this.password = await bcrypt.hash(this.password, rounds);

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  async passwordMatches(password) {
    const result = await bcrypt.compare(password, this.password);

    return result;
  },

  token(refreshToken) {
    const payload = {
      _id: this._id,
      iat: Date.now(),
      refreshToken,
    };

    return jwt.encode(payload, jwtSecret);
  },
});

/**
 * Statics
 */
userSchema.statics = {};

/**
 * @typedef User
 */

const model = mongoose.model('User', userSchema);

model.createIndexes({
  first_name: 1,
  last_name: 1,
});

module.exports = model;
