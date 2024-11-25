const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  selectedStation: { type: String},
  resetPasswordToken: { type: String},
  resetPasswordExpires: { type: Date},
  verificationToken: { type: String},
  verificationExpires: { type: Date},
  isVerified: { type: Boolean, default: false },
  coeficient: { type: Number, enum: [1, 2, 3], default: 1 }, 
  isBlocked: { type: Date, set: (value) => new Date(value).toISOString() },
});
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;