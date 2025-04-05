const mongoose = require('mongoose');

const historicSchema = new mongoose.Schema({
    CourseName: String,
    Year: Number,
    SeatsFilledPercent: Number
  });
  
  module.exports = mongoose.model('Historic', historicSchema);