import React, { useState } from 'react';
import axios from 'axios';
import './Screen2.css'; // ✅ New CSS for screen 2

export default function Screen2({ userInput, llmResponse, setScreen }) {
  console.log(llmResponse)
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me anything about your recommended courses.' }
  ]);
  const [userQuery, setUserQuery] = useState('');

const finalize = async () => {
  if (selectedCourses.length > 0) {
    await axios.post('/api/finalize', { courseNames: selectedCourses });
    setSelectedCourses([]);        // ✅ Clear selected courses
    setChatMessages([
      { sender: 'bot', text: 'Hi! Ask me anything about your recommended courses.' }
    ]);                            // ✅ Reset chatbot
    setUserQuery('');              // ✅ Clear user input
    setScreen(1);                  // ✅ Go back to Screen1
  }
};


  const handleAsk = async () => {
    if (!userQuery.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user', text: userQuery }];
    setChatMessages(newMessages);
    setUserQuery('');

    try {
    await axios.post('/api/chat', {
  contextSummary: `
Student is interested in: ${userInput.title}
Skills: ${userInput.skills}
Top Recommended Courses: ${llmResponse.topCourses.map(c => c.name).join(', ')}
Career Goal: ${llmResponse.careerPath}
`,
  question: userQuery
});

      const answer = response.data.reply;
      setChatMessages([...newMessages, { sender: 'bot', text: answer }]);
    } catch (err) {
      console.error(err);
      setChatMessages([...newMessages, { sender: 'bot', text: "Sorry, I couldn't get a response." }]);
    }
  };

  const handleCheckboxChange = (courseName) => {
    if (selectedCourses.includes(courseName)) {
      setSelectedCourses(selectedCourses.filter(name => name !== courseName));
    } else {
      setSelectedCourses([...selectedCourses, courseName]);
    }
  };

  return (
    <div className="screen2-container">
      <div className="content-box">
        
        {/* Recommended Courses */}
<h2 className="section-title">Top Recommended Courses</h2>
<div className="courses-list">
  {llmResponse?.topCourses.map((course, idx) => (
    <label key={idx} className="course-option">
      <input
        type="checkbox"
        name="course"
        value={course.name}
        checked={selectedCourses.includes(course.name)}
        onChange={() => handleCheckboxChange(course.name)}
      />
      {course.name} — Credits: {course.credits}, Time: {course.time}, Seats: {course.availableSeats}/{course.totalSeats}, Popularity: {course.popularity}
</label>
  ))}
</div>

{llmResponse?.additionalCourses?.length > 0 && (
  <>
    <h2 className="section-title">Additional Courses You Could Consider</h2>
    <div className="courses-list">
      {llmResponse.additionalCourses.map((course, idx) => (
        <label key={`add-${idx}`} className="course-option">
          <input
            type="checkbox"
            name="course"
            value={course.name}
            checked={selectedCourses.includes(course.name)}
            onChange={() => handleCheckboxChange(course.name)}
          />
          {course.name} — Credits: {course.credits}, Time: {course.time}, Seats: {course.seats}, Popularity: {course.popularity}
        </label>
      ))}
    </div>
  </>
)}



        {/* Career Roadmap */}
        <h3 className="section-subtitle">Career Roadmap</h3>
        <p className="regular-text">{llmResponse?.careerPath}</p>

        {/* Possible Job Titles */}
        <h3 className="section-subtitle">Possible Job Titles</h3>
        <ul className="job-list">
          {llmResponse?.jobTitles?.map((title, idx) => (
            <li key={idx}>{title}</li>
          ))}
        </ul>

        {/* Finalize Button */}
        <div className="submit-btn-wrapper">
          <button onClick={finalize} className="submit-btn">
            Finalize Course
          </button>
        </div>

        {/* Chatbot Section */}
        <div className="chatbot-section">
          <h3 className="section-subtitle">Ask a Question</h3>
          <div className="chat-window">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}
              >
                <strong>{msg.sender === 'bot' ? 'Advisor' : 'You'}:</strong> {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input-section">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="chat-input"
              placeholder="Ask something about courses..."
            />
            <button onClick={handleAsk} className="chat-submit-btn">
              Ask
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
