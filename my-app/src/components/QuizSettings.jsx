import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

async function generateQuizQuestions({ numQuestions, types, title, text }) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.REACT_APP_APIKEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let numOpen = 0,
    numMultiple = 0;
  if (types.length === 2) {
    numOpen = Math.round(numQuestions * 0.3);
    numMultiple = numQuestions - numOpen;
  } else if (types.includes("open")) {
    numOpen = numQuestions;
  } else {
    numMultiple = numQuestions;
  }

  let prompt = `Based on the following title and text, generate ${numQuestions} quiz questions.`;
  if (numOpen && numMultiple) {
    prompt += ` 30% should be open questions and 70% should be multiple choice (A, B, C, D).`;
  } else if (numOpen) {
    prompt += ` All should be open questions.`;
  } else {
    prompt += ` All should be multiple choice (A, B, C, D).`;
  }
  prompt += `\nTitle: ${title}\nText: ${text}\n`;
  prompt += `For open questions, provide only the question and the answer. For multiple choice, provide the question, four options (A, B, C, D), and indicate the correct answer. Format as JSON array like this:\n`;
  prompt += `[{"type":"open","question":"...","answer":"..."},{"type":"multiple","question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"B"}]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const output =
    typeof response.text === "function" ? await response.text() : response.text;

  try {
    const jsonStart = output.indexOf("[");
    const jsonEnd = output.lastIndexOf("]");
    const jsonString = output.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
  } catch (e) {
    alert("Failed to parse AI response. Please try again.");
    return [];
  }
}

export default function QuizSettings({ onQuizGenerated, title, text }) {
  const [numQuestions, setNumQuestions] = useState("");
  const [types, setTypes] = useState({
    open: false,
    multiple: false,
  });
  const [showHomeLoading, setShowHomeLoading] = useState(false);

  const handleTypeChange = (e) => {
    setTypes({ ...types, [e.target.value]: e.target.checked });
  };

  const isValidNum = Number(numQuestions) > 0;
  const atLeastOneType = types.open || types.multiple;

  const handleStart = async () => {
    setShowHomeLoading(true);
    try {
      const selectedTypes = Object.keys(types).filter((t) => types[t]);
      const questions = await generateQuizQuestions({
        numQuestions,
        types: selectedTypes, 
        title,
        text,
      });
      onQuizGenerated(questions);
    } finally {
      setShowHomeLoading(false);
    }
  };

  if (showHomeLoading) {
    return (
      <div
        style={{
          height: "300px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
        <span style={{ marginTop: 16, fontSize: 18 }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="card mx-auto" style={{ maxWidth: 400, marginTop: 80 }}>
      <div className="card-header">Quiz Settings</div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Number of Questions</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            placeholder="Enter number"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Question Types</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="open"
              id="openCheck"
              checked={types.open}
              onChange={handleTypeChange}
            />
            <label className="form-check-label" htmlFor="openCheck">
              Open Question
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="multiple"
              id="multipleCheck"
              checked={types.multiple}
              onChange={handleTypeChange}
            />
            <label className="form-check-label" htmlFor="multipleCheck">
              Multiple Choice (A, B, C, D)
            </label>
          </div>
        </div>
        <button
          className="btn btn-primary w-100"
          disabled={!isValidNum || !atLeastOneType}
          onClick={handleStart}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}