import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Screen1.css'; // ✅ New CSS file

export default function Screen1({ setScreen, setUserInput, setLlmResponse }) {
  const [input, setInput] = useState({
    title: '', skills: '', credits: 0, fullTime: true, selectedCourses: []
  });
  const [courseList, setCourseList] = useState([]);

  useEffect(() => {
    axios.get('/api/course')
      .then(res => setCourseList(res.data));
  }, []);

const handleSubmit = async () => {
  setUserInput(input);
  const res = await axios.post('/api/recommend', { input });
  setLlmResponse(res.data);
  setScreen(2);
};


  // Group courses by Department
  const groupedCourses = courseList.reduce((groups, course) => {
    const dept = course.Department || "Other";
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(course);
    return groups;
  }, {});

  return (
    <div className="screen1-container">
      <div className="form-box">
        <h1 className="form-title">Smart Course Picks</h1>
        <p className="form-subtitle">Fill the details below for personalized suggestions</p>

        <div className="form-group">
          <label>Field of interest or job role</label>
          <input
            type="text"
            placeholder="e.g., Data Science"
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Skills to develop</label>
          <input
            type="text"
            placeholder="e.g., Python, Machine Learning"
            value={input.skills}
            onChange={(e) => setInput({ ...input, skills: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Credits to Enroll</label>
          <input
            type="number"
            placeholder="e.g., 10"
            value={input.credits}
            onChange={(e) => setInput({ ...input, credits: +e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Enrollment type</label>
          <select
            value={input.fullTime}
            onChange={(e) => setInput({ ...input, fullTime: e.target.value === 'true' })}
          >
            <option value="true">Full-Time</option>
            <option value="false">Part-Time</option>
          </select>
        </div>

<div className="form-group">
  <label className="past-courses-label">Past courses taken</label> {/* ✅ Use new label class */}
  <p className="disclaimer">(F) = Full-Time, (P) = Part-Time</p>

  <div className="courses-grid">
    {Object.keys(groupedCourses).map((dept) => (
      <div key={dept} className="department-section">
        <h3 className="department-title">{dept}</h3>
        <div className="courses-options">
{groupedCourses[dept].map((c) => (
  <label key={c.CourseID} className="course-option" style={{ color: '#333333', fontSize: '14px' }}>
    <input
      type="checkbox"
      name="selectedCourses"
      value={c.CourseName}
      checked={input.selectedCourses.includes(c.CourseName)}
      onChange={(e) => {
        const course = e.target.value;
        const selected = input.selectedCourses.includes(course)
          ? input.selectedCourses.filter(item => item !== course)
          : [...input.selectedCourses, course];
        setInput({ ...input, selectedCourses: selected });
      }}
    />
    {c.CourseName} ({c.FPTime?.toLowerCase() === 'fulltime' ? 'F' : 'P'})
  </label>
))}

        </div>
      </div>
    ))}
  </div>
</div>



        <div className="submit-btn-wrapper">
          <button onClick={handleSubmit} className="submit-btn">
            Recommend Courses
          </button>
        </div>
      </div>
    </div>
  );
}
