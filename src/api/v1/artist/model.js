const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jwt-simple');
// const { jwtSecret } = require('../../../config');

/**
 * User Schema
 * @private
 */

const artistSchema = new mongoose.Schema({
  access_token: { type: String },
  address: {
    type: String, default: '',
  },
  city: { type: String },
  country: { type: String },
  created_at: {
    default: Date.now,
    type: Number,
  },
  label: {
    type: String, default: '',
  },
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
  profile_image: { type: String },
  banner_image: { type: String },
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
  social_token_id: {
    default: null,
    type: String,
  },
  social_toke_name: { type: String },
  social_token_symbol: { type: String },
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
// artistSchema.pre('save', async function save(next) {
//   try {
//     // eslint-disable-next-line no-invalid-this
//     if (!this.isModified('password')) return next();

//     const rounds = 10;

//     // eslint-disable-next-line no-invalid-this
//     this.password = await bcrypt.hash(this.password, rounds);

//     return next();
//   } catch (error) {
//     return next(error);
//   }
// });

/**
 * Methods
 */
// artistSchema.method({
//   async passwordMatches(password) {
//     const result = await bcrypt.compare(password, this.password);

//     return result;
//   },

//   token(refreshToken) {
//     const payload = {
//       _id: this._id,
//       iat: Date.now(),
//       refreshToken,
//     };

//     return jwt.encode(payload, jwtSecret);
//   },
// });

/**
 * Statics
 */
// artistSchema.statics = {};

/**
 * @typedef Artist
 */

const model = mongoose.model('Artist', artistSchema);

// model.createIndexes({
//   first_name: 1,
//   last_name: 1,
// });

module.exports = model;
