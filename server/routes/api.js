const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Historic = require('../models/Historic');
const { getSeatPopularity } = require('../utils/query');
const { getLLMResponse } = require('../utils/llm');
const { parseLLMOutput } = require('../utils/llm');

router.get('/course', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

router.get('/historics', async (req, res) => {
    const historic = await Historic.find();
    res.json(historic);
  });

  router.post('/recommend', async (req, res) => {
    try {
      const input = req.body.input;
  
      // Fetch all courses and enrich with popularity
      const courses = await Course.find();
      const courseInfo = await Promise.all(
        courses.map(async (c) => {
          const popularity = await getSeatPopularity(c.CourseName);
          return `${c.CourseName} - ${c.Description}, Credits: ${c.Credits}, Time: ${c.Time}, Popularity: ${popularity}`;
        })
      );
  
      // Construct prompt for LLM
      const prompt = `
  You are an AI course advisor. Here are available courses:
  
  ${courseInfo.join('\n')}
  
  The student says:
  """${JSON.stringify(input)}"""
  
  Recommend courses that fit their field of interest/title or job role, with no time conflict schedule, and the user has already taken prerequisite courses.
  Check the remaining number of credits they require given that maximum credit can be 30.
  Give top 3 courses and if unavailable suggest 2 other courses of the same credit.
  Also always mention what could be the career path taking these courses and what job titles they can end up as.
  Respond in plain English.
      `;
  
      const llmResponse = await getLLMResponse(prompt); // returns text
    //   const parsed = parseLLMOutput(llmResponse);       // extract topCourses, careerPath
  
      // Add seat info to top courses
      const updatedCourses = await Promise.all(
        llmResponse.topCourses.map(async (course) => {
          const dbCourse = await Course.findOne({ CourseName: course.name });
          return {
            ...course,
            seats: dbCourse ? dbCourse.AvailableSlots : 'Unknown'
          };
        })
      );
  
      res.json({
        topCourses: updatedCourses,
        careerPath: llmResponse.careerPath,
        jobTitles: llmResponse.jobTitles
      });
  
    } catch (err) {
      console.error('❌ /recommend failed:', err);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });
  

router.post('/finalize', async (req, res) => {
  const course = await Course.findOne({ CourseName: req.body.courseName });
  if (course && course.AvailableSlots > 0) {
    course.AvailableSlots -= 1;
    await course.save();
  }
  res.json({ success: true });
});

router.get('/test', async (req, res) => {
    try {
      await mongoose.connection.db.admin().ping(); // Ping the DB
      res.json({ status: 'MongoDB connected ✅' });
    } catch (err) {
      res.status(500).json({ status: 'MongoDB not connected ❌', error: err.message });
    }
  });
  


module.exports = router;