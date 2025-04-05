const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  CourseID: String,
  CourseName: String,
  TotalSeats: Number,
  AvailableSlots: Number,
  Time: String,
  Description: String,
  Credits: Number,
  Prerequisites: [String],
  Department: String
});

module.exports = mongoose.model('course', courseSchema);