import React, { useState } from 'react';
import axios from 'axios';

// export default function Screen2({ userInput, llmResponse, setScreen }) {
//   const [selectedCourse, setSelectedCourse] = useState(null);
export default function Screen2({ userInput, llmResponse, setScreen }) {
const [selected, setSelected] = useState(null);

const [chatMessages, setChatMessages] = useState([
  { sender: 'bot', text: 'Hi! Ask me anything about your recommended courses.' }
]);
const [userQuery, setUserQuery] = useState('');

  const finalize = async () => {
    if (selectedCourse) {
      await axios.post('/api/finalize', { courseName: selectedCourse });
      setScreen(1);
    }
  };

  // 3️⃣ Handle user questions
  const handleAsk = async () => {
    if (!userQuery.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user', text: userQuery }];
    setChatMessages(newMessages);
    setUserQuery('');

    try {
      const response = await axios.post('/api/chat', {
        userInput,
        llmResponse,
        message: userQuery
      });

      const answer = response.data.reply;
      setChatMessages([...newMessages, { sender: 'bot', text: answer }]);
    } catch (err) {
      console.error(err);
      setChatMessages([...newMessages, { sender: 'bot', text: "Sorry, I couldn't get a response." }]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recommended Courses</h2>
      {llmResponse?.topCourses.map((course, idx) => (
        <div key={idx}>
          <input type="radio" name="course" value={course.name} onChange={() => setSelectedCourse(course.name)} />
          <label>{course.name} -Credits:{course.credits}-Time:{course.time} Seats Available: {course.seats}</label>
        </div>
      ))}
      <div>
        <h3 className="text-lg font-semibold">Career Roadmap</h3>
        <p>{llmResponse?.careerPath}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Possible Job Titles</h3>
        <ul className="list-disc ml-6">
  {llmResponse?.jobTitles?.map((title, idx) => (
    <li key={idx}>{title}</li>
  ))}
</ul>
      </div>
      <button onClick={finalize}>Finalize Course</button>
    {/* 💬 Chatbot */}
    <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Ask a Question</h3>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.sender === 'bot' ? 'text-blue-700' : 'text-gray-800'}`}>
              <strong>{msg.sender === 'bot' ? 'Advisor' : 'You'}:</strong> {msg.text}
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="border p-2 flex-1 rounded"
            placeholder="Ask something..."
          />
          <button onClick={handleAsk} className="bg-blue-600 text-white px-4 py-2 rounded">
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
