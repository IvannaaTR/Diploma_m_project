const mongoose = require('mongoose');
const airSchema = new mongoose.Schema({
    createdAt: {
      type: Date,
      default: Date.now,
      set: () => new Date().toISOString(),
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    cityName: { type: String, required: true },
    stationName: { type: String, required: true },
    AQI: { type: Number, required: true },
    pollutants: {
      humidity: { type: Number, required: true },
      PM10: { type: Number, required: true },
      PM25: { type: Number, required: true },
      temperature: { type: Number, required: true },
    },
  });

const AirStationModel = mongoose.model('AirStation', airSchema);
module.exports = AirStationModel;