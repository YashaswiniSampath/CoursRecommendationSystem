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
    <div className="min-h-screen w-full bg-gray-100 py-10 px-4 flex justify-center">
      <div className="bg-white shadow-md rounded-xl p-10 w-full max-w-2xl space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-800">AI Course Recommendation Form</h1>
          <p className="text-gray-600 mt-2">Fill in the details to get personalized course recommendations</p>
        </div>
  
        {/* Field: Field of Interest */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Field of interest or job role</label>
          <input
            type="text"
            placeholder="e.g., Data Science"
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            onChange={(e) => setInput({ ...input, title: e.target.value })}
          />
        </div>
  
        {/* Field: Skills */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Skills to develop</label>
          <input
            type="text"
            placeholder="e.g., Python, Machine Learning"
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            onChange={(e) => setInput({ ...input, skills: e.target.value })}
          />
        </div>
  
        {/* Field: Remaining Credits */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Remaining credits</label>
          <input
            type="number"
            placeholder="e.g., 10"
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            onChange={(e) => setInput({ ...input, credits: +e.target.value })}
          />
        </div>
  
        {/* Field: Enrollment Type */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Enrollment type</label>
          <select
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            onChange={(e) => setInput({ ...input, fullTime: e.target.value === 'true' })}
          >
            <option value="true">Full-Time</option>
            <option value="false">Part-Time</option>
          </select>
        </div>
  
        {/* Field: Past Courses */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Past courses taken</label>
          <select
            multiple
            className="p-3 border rounded-md h-32 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            onChange={(e) => {
              const selected = [...e.target.selectedOptions].map(o => o.value);
              setInput({ ...input, selectedCourses: selected });
            }}
          >
            {courseList.map(c => (
              <option key={c.CourseID} value={c.CourseName}>
                {c.CourseName}
              </option>
            ))}
          </select>
        </div>
  
        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold px-6 py-3 rounded-full shadow-md"
          >
            🚀 Recommend Courses
          </button>
        </div>
      </div>
    </div>
  );
  
}  