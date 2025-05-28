import React, { useState } from "react";

export default function QuizSettings({ onStart }) {
  const [numQuestions, setNumQuestions] = useState("");
  const [types, setTypes] = useState({
    open: false,
    multiple: false,
  });

  const handleTypeChange = (e) => {
    setTypes({ ...types, [e.target.value]: e.target.checked });
  };

  const isValidNum = Number(numQuestions) > 0;
  const atLeastOneType = types.open || types.multiple;

  const handleStart = () => {
    if (isValidNum && atLeastOneType) {
      onStart({
        numQuestions: Number(numQuestions),
        types: Object.keys(types).filter((t) => types[t]),
      });
    }
  };

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
