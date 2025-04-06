const axios = require('axios');

async function getLLMResponse(prompt) {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'gemma:2b',
      prompt: prompt,
      stream: false
    });

    console.log('LLM raw response:', response.data);

    const raw = response.data.response;
    console.log('----------------- Raw Response -----------------\n', raw);

    if (typeof raw !== 'string') {
      throw new Error('LLM response is not a string');
    }

    return parseLLMOutput(raw);
  } catch (error) {
    console.error('Ollama LLM error:', error.message);
    return { topCourses: [], additionalCourses: [], careerPath: 'Error generating response.', jobTitles: [] };
  }
}

function parseLLMOutput(text) {
  if (!text || typeof text !== 'string') {
    console.warn('Invalid LLM output:', text);
    return { topCourses: [], additionalCourses: [], careerPath: '', jobTitles: [] };
  }

  console.log('📥 Raw LLM Output:\n', text);

  const lines = text.split('\n');
  const topCourses = [];
  const additionalCourses = [];

  let currentSection = 'top';
  let careerPath = '';
  let captureCareerPath = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.includes('**Top Recommended Courses**')) {
      currentSection = 'top';
      continue;
    }
    if (trimmedLine.includes('**Additional Courses You Could Consider**')) {
      currentSection = 'additional';
      continue;
    }
    if (trimmedLine.includes('**Career Roadmap**')) {
      captureCareerPath = true;
      continue;
    }
    if (trimmedLine.includes('**Potential Job Titles**')) {
      captureCareerPath = false;
      continue;
    }

    if (captureCareerPath) {
      careerPath += trimmedLine + ' ';
      continue;
    }

    // Match lines starting with "=" and split by hyphens
    if (trimmedLine.startsWith('=')) {
      let cleanLine = trimmedLine.replace(/^==\s*/, ''); // Remove '=' or '= '

      const parts = cleanLine.split('-').map(p => p.trim()).filter(Boolean);
      console.log(parts)
      if (parts.length >= 5) {
        const course = {
          name: parts[0],
          credits: isNaN(parseInt(parts[1])) ? null : parseInt(parts[1]),
          time: parts[2],
          seatsInfo: parts[3],
          popularity: parts[4]
        };

        // Skip full courses if needed
        if (course.seatsInfo.includes('Full')) {
          console.warn('⚠️ Skipping full course:', course.name);
          continue;
        }

        if (currentSection === 'top') {
          topCourses.push(course);
        } else if (currentSection === 'additional') {
          additionalCourses.push(course);
        }
      }
    }
  }

  // Parse job titles from last section
  const jobTitles = [];
  const jobTitlesSection = text.split('**Potential Job Titles**')[1];
  if (jobTitlesSection) {
    const titles = jobTitlesSection.split('\n')
      .map(t => t.trim())
      .filter(t => (t.startsWith('-') || t.startsWith('*')) && t.length > 2);
    titles.forEach(t => jobTitles.push(t.replace(/^[-*]\s*/, '').trim()));
  }

  return {
    topCourses,
    additionalCourses,
    careerPath: careerPath.trim(),
    jobTitles
  };
}

module.exports = { getLLMResponse, parseLLMOutput };
