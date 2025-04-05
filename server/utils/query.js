const Historic = require('../models/Historic');

async function getSeatPopularity(courseName) {
  const data = await Historic.find({ CourseName: courseName }).sort({ Year: -1 }).limit(1);
  if (data.length === 0) return 'No history';
  return data[0].SeatsFilledPercent > 80 ? 'Highly sought-after' : 'Low demand';
}

module.exports = { getSeatPopularity };