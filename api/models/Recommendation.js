const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  owner: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
  title: { type: String, required: true },
  photos: { type: [String], required: true },
  description: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    set: () => new Date().toISOString(),
  },
});

const RecommendationModel = mongoose.model('Recommendation', recommendationSchema);

module.exports = RecommendationModel;