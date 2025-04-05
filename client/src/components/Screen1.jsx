import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Screen1({ setScreen, setUserInput, setLlmResponse }) {
  const [input, setInput] = useState({
    title: '', skills: '', credits: 0, fullTime: true, selectedCourses: []
  });
  const [courseList, setCourseList] = useState([]);

  useEffect(() => {
    axios.get('/api/course')
      .then(res => setCourseList(res.data))
      .catch(console.error);
  }, []);

  const handleSubmit = async () => {
    setUserInput(input);
    const res = await axios.post('/api/recommend', { input });
    setLlmResponse(res.data);
    setScreen(2);
  };

  return (
    <div className="space-y-4">
      <input type="text" placeholder="Field of interest or job role" onChange={(e) => setInput({ ...input, title: e.target.value })} />
      <input type="text" placeholder="Skills to develop" onChange={(e) => setInput({ ...input, skills: e.target.value })} />
      <input type="number" placeholder="Remaining credits" onChange={(e) => setInput({ ...input, credits: +e.target.value })} />
      <select onChange={(e) => setInput({ ...input, fullTime: e.target.value === 'true' })}>
        <option value="true">Full-Time</option>
        <option value="false">Part-Time</option>
      </select>
      <div>
        <label>Past Courses:</label>
        <select multiple onChange={(e) => {
          const selected = [...e.target.selectedOptions].map(o => o.value);
          setInput({ ...input, selectedCourses: selected });
        }}>
          {courseList.map(c => <option key={c.CourseID} value={c.CourseName}>{c.CourseName}</option>)}
        </select>
      </div>
      <button onClick={handleSubmit}>Recommend Courses</button>
    </div>
  );
}