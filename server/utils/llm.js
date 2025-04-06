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
    if (!text || typeof text !== 'string') {
      console.warn('Invalid LLM output:', text);
      return { topCourses: [], careerPath: '', jobTitles: [] };
    }
  
    console.log('📥 Raw LLM Output:\n', text);
  
    // 1. Extract Top 3 Courses
    const topCourses = [];
  const lines = text.split('\n');

  const courseRegex = /^\d+\.\s*\*\*(.*?)\s*\((\d+)\s*credits?,\s*(.*?),\s*(\d+)\s*seats\)\*\*/;

  for (const line of lines) {
    const match = line.match(courseRegex);
    if (match && topCourses.length < 3) {
      topCourses.push({
        name: match[1].trim(),
        credits: parseInt(match[2]),
        time: match[3].trim(),
        seats: parseInt(match[4]),
      });
    }
}
  
    console.log('🎯 Extracted Top 3 Courses:', topCourses);
  
    // 2. Extract Suggested Career Path
    const careerMatch = text.match(/\*\*Suggested Career Path\*\*\s*(.+?)\n/i);
    const careerPath = careerMatch ? careerMatch[1].trim() : '';
    console.log('🛣️ Career Path:', careerPath);
  
    // 3. Extract Job Titles
    const jobTitles = [];
    const jobSection = text.split(/\*\*Potential Job Titles\*\*/i)[1];
  
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
