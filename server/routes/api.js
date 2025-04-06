const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Historic = require('../models/Historic');
const { getSeatPopularity } = require('../utils/query');
const { getLLMResponse } = require('../utils/llm');
const { parseLLMOutput } = require('../utils/llm');
const axios = require('axios');

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
You are an AI course advisor. Your job is to recommend courses from the following list, considering the student's interests, schedule, and eligibility.

Here are the available courses:
${courseInfo.join('\n')}

The student says:
"""${JSON.stringify(input)}"""

Please respond with the following structured format:

---

**Top 3 Recommended Courses**  
(List the 3 best courses that match the student's interests, have no time conflicts, and for which all prerequisites are satisfied.)

1. Course Name (X credits, Day Time, Y seats)
2. Course Name (X credits, Day Time, Y seats)
3. Course Name (X credits, Day Time, Y seats)

**Suggested Career Path**  
(Briefly explain — in 1-2 lines — how these courses contribute to the student's long-term academic or career goals.)

**Potential Job Titles**  
(List 2–4 roles the student could apply for after completing the recommended courses.)

---

📌 Additional Notes:
- Ensure the total number of credits (including already completed courses, found in the user input) does **not exceed 30**.
- If 3 ideal courses are not available, suggest 2 alternative courses of similar credit value.
- Be concise and respond in plain English.
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


  router.post('/chat', async (req, res) => {
    const { userInput, llmResponse, message } = req.body;
  
    const chatPrompt = `
  You are an academic course advisor chatbot. The student was previously recommended the following:
  
  Top Courses:
  ${llmResponse.topCourses.join('\n')}
  
  Career Path: ${llmResponse.careerPath}
  Job Titles: ${llmResponse.jobTitles.join(', ')}
  
  Student Profile:
  ${JSON.stringify(userInput)}
  
  Now, answer this follow-up question in simple, friendly language, when asked why certain course is recommended exlain how it algins with the requested field they asked for:
  """${message}"""
  `;
  
  try {
    const llamaResponse = await axios.post('http://localhost:11434/api/generate', {
      model: 'gemma:2b', // Change this to the model name you're running
      prompt: chatPrompt,
      stream: false // use `true` for streaming responses
    });

    const aiReply = llamaResponse.data.response;
    res.json({ reply: aiReply });
  } catch (err) {
    console.error('❌ Error talking to LLaMA:', err.message);
    res.status(500).json({ reply: "Sorry, the AI is currently unavailable." });
  }
});

module.exports = router;