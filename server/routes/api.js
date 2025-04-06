const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Historic = require('../models/Historic');
const { getSeatPopularity } = require('../utils/query');
const { getLLMResponse, parseLLMOutput } = require('../utils/llm');
const axios = require('axios');

router.get('/course', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

router.get('/historics', async (req, res) => {
    const historic = await Historic.find();
    res.json(historic);
  });


// server/routes.js (your recommend API)


router.post('/recommend', async (req, res) => {
  try {
    const input = req.body.input;
    const { title, skills, selectedCourses: userPastCourses, credits: desiredCredits, fullTime } = input;

    const allCourses = await Course.find();
    const skillsArray = skills.toLowerCase().split(',').map(s => s.trim());
    const interestKeywords = [title.toLowerCase(), ...skillsArray];

    let filteredCourses = [];

    for (const course of allCourses) {
      if (userPastCourses.includes(course.CourseName)) continue;

      const isFullTimeCourse = course.FPTime?.toLowerCase() === 'fulltime';
      if ((fullTime && !isFullTimeCourse) || (!fullTime && isFullTimeCourse)) continue;

      if (course.Prerequisite && !userPastCourses.includes(course.Prerequisite)) continue;

      const desc = (course.Description || '').toLowerCase();
      let matchScore = interestKeywords.reduce((score, keyword) => {
        return desc.includes(keyword) ? score + 1 : score;
      }, 0);

      const popularity = await getSeatPopularity(course.CourseName);

      filteredCourses.push({
        ...course._doc,
        matchScore,
        popularity,
        isFull: course.AvailableSlots === 0
      });
    }

    filteredCourses.sort((a, b) => b.matchScore - a.matchScore);
    const topCourses = filteredCourses.slice(0, 7);

    const courseInfo = topCourses.map(c => {
      const seatsInfo = c.TotalSeats ? `${c.AvailableSlots}/${c.TotalSeats}` : 'Unknown seats';
      let line = `${c.CourseName} - ${c.Description}, Credits: ${c.Credits}, Time: ${c.Time}, Seats: ${seatsInfo}, Popularity: ${c.popularity}`;

      if (c.Prerequisite && userPastCourses.includes(c.Prerequisite)) {
        line += ` (Prerequisite Met ✅)`;
      }

      if (c.isFull) {
        line += ` (⚠️ Course Full - suggest alternative if needed)`;
      }

      return line;
    });

    const prompt = `
You are an expert AI academic advisor.

Here is a list of available courses:
${courseInfo.join('\n')}

Student Profile:
"""${JSON.stringify(input)}"""

Selection Rules:
- Recommend a combination of courses that match the student's requested ${desiredCredits} credits.
- Match the student's enrollment type (${fullTime ? "Full-Time" : "Part-Time"}).
- Prefer courses that match the student's interests, field, and skills.
- Prefer highly sought-after courses when possible.
- Prefer courses where seats are still available.
- If a course is marked ⚠️ Full, mention it but suggest an alternative course nearby.
- If a course shows (Prerequisite Met ✅), prefer recommending it.
- Avoid recommending any course the student has already completed.
- Ensure no time conflicts between selected courses.
- Pick courses only from list of available courses

Respond exactly in this format:

---

**Top Recommended Courses**  
= Course Name-Credits-Day/Time-Seats Available-Total-Popularity =$
= Course Name-Credits-Day/Time-Seats Available-Total-Popularity =$

**Additional Courses You Could Consider**  
= Course Name-Credits-Day/Time-Seats Available-Total-Popularity =$
= Course Name-Credits-Day/Time-Seats Available-Total-Popularity =$
= Course Name-Credits-Day/Time-Seats Available-Total-Popularity =$

**Career Roadmap**  
(One or two sentences.)

**Potential Job Titles**  
- Title 1
- Title 2
- Title 3

---
`;

    // const llmRawResponse = await getLLMResponse(prompt);

    // const parsed = parseLLMOutput(llmRawResponse.response); // ✅ now parsing properly
    //parseLLMOutput is returning 
  //     return {
  //   topCourses,
  //   additionalCourses,
  //   careerPath,
  //   jobTitles
  // }
    const llmParsed = await getLLMResponse(prompt);

    res.json({
      topCourses: llmParsed.topCourses,
      additionalCourses: llmParsed.additionalCourses,
      careerPath: llmParsed.careerPath,
      jobTitles: llmParsed.jobTitles
    });

  } catch (err) {
    console.error('❌ /recommend error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});


router.post('/finalize', async (req, res) => {
  const { courseNames } = req.body; // ✅ Expect an array of course names

  if (!Array.isArray(courseNames)) {
    return res.status(400).json({ error: "courseNames must be an array." });
  }

  try {
    for (const courseName of courseNames) {
      const course = await Course.findOne({ CourseName: courseName });
      if (course && course.AvailableSlots > 0) {
        course.AvailableSlots -= 1;
        await course.save();
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error finalizing courses:', err);
    res.status(500).json({ error: 'Failed to finalize courses.' });
  }
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
const { contextSummary, question } = req.body;

const chatPrompt = `
You are an academic advisor chatbot.

Student profile:
${contextSummary}

Now answer the student's question:
"""${question}"""
`;

  
  try {
    const llamaResponse = await axios.post('http://localhost:11434/api/generate', {
      model: 'wizardlm2:7b', // Change this to the model name you're running
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
