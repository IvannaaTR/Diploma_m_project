const mongoose = require('mongoose');

const initiantiveSchema = new mongoose.Schema({
  owner: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
  title: { type: String, required: true },
  address: String, 
  photos: { type: [String], required: true },
  description: { type: String, required: true },
  extraInfo: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    set: () => new Date().toISOString(),
  },
});

const InitiantiveModel = mongoose.model('Initiative', initiantiveSchema);

module.exports = InitiantiveModel;