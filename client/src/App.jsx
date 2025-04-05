import React, { useState } from 'react';
import Screen1 from './components/Screen1';
import Screen2 from './components/Screen2';

export default function App() {
  const [screen, setScreen] = useState(1);
  const [userInput, setUserInput] = useState(null);
  const [llmResponse, setLlmResponse] = useState(null);

  return (
    <div className="p-4">
      {screen === 1 ? (
        <Screen1 setScreen={setScreen} setUserInput={setUserInput} setLlmResponse={setLlmResponse} />
      ) : (
        <Screen2 userInput={userInput} llmResponse={llmResponse} setScreen={setScreen} />
      )}
    </div>
  );
}
