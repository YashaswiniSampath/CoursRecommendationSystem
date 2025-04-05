import React, { useState } from 'react';
import axios from 'axios';

// export default function Screen2({ userInput, llmResponse, setScreen }) {
//   const [selectedCourse, setSelectedCourse] = useState(null);
export default function Screen2({ userInput, llmResponse, setScreen }) {
const [selected, setSelected] = useState(null);

  const finalize = async () => {
    if (selectedCourse) {
      await axios.post('/api/finalize', { courseName: selectedCourse });
      setScreen(1);
    }
  };

  return (
    <div className="space-y-4">
      <h2>Recommended Courses</h2>
      {llmResponse.topCourses.map((course, idx) => (
        <div key={idx}>
          <label>
            <input
              type="radio"
              name="selectedCourse"
              value={course.name}
              onChange={() => setSelected(course.name)}
            />
            {course.name} - {course.credits} credits ({course.seats} seats available)
          </label>
        </div>
      ))}

      <h3>Career Path</h3>
      <p>{llmResponse.careerPath}</p>

      <h3>Job Titles</h3>
      <ul>
        {llmResponse.jobTitles.map((title, i) => <li key={i}>{title}</li>)}
      </ul>

      <button onClick={() => setScreen(1)}>Finalize & Go Back</button>
    </div>
  );
}