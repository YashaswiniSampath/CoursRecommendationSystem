const axios = require('axios');

async function getLLMResponse(prompt) {
    try {
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'gemma:2b',
        prompt: prompt,
        stream: false
      });
  
      console.log('🧠 LLM raw response:', response.data); // 👈 Add this!
      
      const raw = response.data.response; // may be undefined or object
      console.log('-----------------',raw)
      if (typeof raw !== 'string') {
        throw new Error('LLM response is not a string');
      }
  
      return parseLLMOutput(raw);
    } catch (error) {
      console.error('Ollama LLM error:', error.message);
      return { topCourses: [], careerPath: 'Error generating response.' };
    }
  }
  

  function parseLLMOutput(text) {
    // if (!text || typeof text !== 'string') {
    //   console.warn('Invalid LLM output:', text);
    //   return { topCourses: [], careerPath: '', jobTitles: [] };
    // }
    console.log(text)
    // 🔍 Get only the "**Top 3:**" block
  

  // ✅ Match: **Course Name** (X credits)
  const courseRegex = /\*\*(.*?)\*\*\s*\((\d+)\scredits?\)/g;
  const topCourses = [];
  let match;

  while ((match = courseRegex.exec(text)) !== null && topCourses.length < 3) {
    topCourses.push({
      name: match[1].trim(),
      credits: parseInt(match[2]),
      seats: 0
    });
  }

  console.log('🎯 Extracted Top 3 Courses:', topCourses);
  
    // 2. Extract Career Path
  const careerMatch = text.match(/\*\*Career Path:\*\*\s*(.*)/i);
  const careerPath = careerMatch ? careerMatch[1].trim() : '';
  console.log('🛣️ Career Path:', careerPath);

  // 3. Extract Job Titles
  const jobTitles = [];
  const jobSection = text.split(/\*\*Job Titles:\*\*/i)[1];

  if (jobSection) {
    const lines = jobSection.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('*') || line.startsWith('-')) {
        jobTitles.push(line.replace(/^[-*]\s*/, '').trim());
      }
    }
  }

  console.log('💼 Job Titles:', jobTitles);

  return {
    topCourses,
    careerPath,
    jobTitles
  };
}

  

module.exports = { getLLMResponse, parseLLMOutput };
