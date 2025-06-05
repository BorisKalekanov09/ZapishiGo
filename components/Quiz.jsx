import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Quiz({ questions, text, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showedAnswer, setShowedAnswer] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [questionScore, setQuestionScore] = useState(1);
  const [questionScores, setQuestionScores] = useState(
    Array(questions.length).fill(0)
  );
  const [showDetails, setShowDetails] = useState(false);

  const question = questions[current];

  const handleCheck = async () => {
    if (showedAnswer) return; 

    if (question.type === "open") {
      setChecking(true);
      const apiKey = process.env.REACT_APP_APIKEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Given the following text:\n${text}\n\nIs the following answer correct for the question "${question.question}"?\nUser answer: "${userAnswer}"\nCorrect answer: "${question.answer}"\nRespond only with "correct" or "wrong".`;
      const resultAI = await model.generateContent(prompt);
      const response = await resultAI.response;
      const output =
        typeof response.text === "function"
          ? await response.text()
          : response.text;
      const isCorrect = output.toLowerCase().includes("correct");
      setResult(isCorrect ? "correct" : "wrong");
      if (isCorrect) {
        setScore((prev) => prev + Math.max(0, questionScore));
        setQuestionScores((prev) => {
          const updated = [...prev];
          updated[current] = Math.max(0, questionScore);
          return updated;
        });
      } else {
        setQuestionScore((prev) => {
          const newScore = prev - 0.25;
          return newScore < 0 ? 0 : newScore;
        });
      }
      setChecking(false);
    } else {
      const isCorrect = userAnswer === question.answer;
      setResult(isCorrect ? "correct" : "wrong");
      if (isCorrect) {
        setScore((prev) => prev + Math.max(0, questionScore));
        setQuestionScores((prev) => {
          const updated = [...prev];
          updated[current] = Math.max(0, questionScore);
          return updated;
        });
      } else {
        setQuestionScore((prev) => {
          const newScore = prev - 0.25;
          return newScore < 0 ? 0 : newScore;
        });
      }
    }
  };

  const handleShowAnswer = async () => {
    setShowedAnswer(true);
    setResult(null); 
    setQuestionScore(0); 
    if (question.type === "open") {
      const apiKey = process.env.REACT_APP_APIKEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Based on the following text:\n${text}\n\nWhat is the correct answer to the question: "${question.question}"?\nGive only the answer.`;
      const resultAI = await model.generateContent(prompt);
      const response = await resultAI.response;
      const output =
        typeof response.text === "function"
          ? await response.text()
          : response.text;
      setAiAnswer(output.trim());
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setResult(null);
    setShowedAnswer(false);
    setAiAnswer("");
    setQuestionScore(1);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  const getMotivation = (percent) => {
    if (percent > 80) return "You did it excellent!";
    if (percent > 65) return "You did it great!";
    if (percent > 40) return "You did it ok!";
    if (percent >= 20) return "Your results are not very good.";
    return "Bad result.";
  };

  if (finished && showDetails) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="card w-100" style={{ maxWidth: 600 }}>
          <div className="card-body">
            <h3 className="mb-3 text-center">Detailed Results</h3>
            <ul className="list-group mb-3">
              {questions.map((q, idx) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={idx}
                >
                  <span>
                    <strong>Q{idx + 1}:</strong> {q.question}
                  </span>
                  <span>
                    <strong>{questionScores[idx].toFixed(2)}</strong> / 1
                  </span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetails(false)}
              >
                Back to Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const percent = (score / questions.length) * 100;
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="card w-100" style={{ maxWidth: 500 }}>
          <div className="card-body text-center">
            <h3 className="mb-3">Quiz Finished!</h3>
            <h4>
              Result: {score.toFixed(2)} / {questions.length}
            </h4>
            <p className="mt-3 fs-5">{getMotivation(percent)}</p>
            <button className="btn btn-primary mt-3 me-2" onClick={onFinish}>
              Back to Settings
            </button>
            <button
              className="btn btn-outline-secondary mt-3"
              onClick={() => setShowDetails(true)}
            >
              See Detailed Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}
    >
      <div
        className={`card w-100`}
        style={{
          maxWidth: 500,
          borderColor:
            result === "correct"
              ? "green"
              : result === "wrong"
              ? "red"
              : undefined,
          borderWidth: result ? 2 : 1,
        }}
      >
        <div className="card-body">
          <h5 className="card-title">
            Question {current + 1} of {questions.length}
          </h5>
          <p className="card-text">{question.question}</p>
          {question.type === "multiple" ? (
            <div>
              {question.options.map((opt, idx) => (
                <div
                  className={`form-check ${
                    showedAnswer &&
                    question.answer === ["A", "B", "C", "D"][idx]
                      ? "bg-success bg-opacity-25"
                      : ""
                  }`}
                  key={idx}
                >
                  <input
                    className="form-check-input"
                    type="radio"
                    name="answer"
                    id={`opt${idx}`}
                    value={["A", "B", "C", "D"][idx]}
                    checked={userAnswer === ["A", "B", "C", "D"][idx]}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={showedAnswer}
                  />
                  <label className="form-check-label" htmlFor={`opt${idx}`}>
                    {opt}
                  </label>
                </div>
              ))}
              {showedAnswer && (
                <div className="alert alert-info mt-2">
                  Correct answer: {question.answer}
                </div>
              )}
            </div>
          ) : (
            <>
              <input
                className="form-control"
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={showedAnswer}
                placeholder="Type your answer"
              />
              {showedAnswer && (
                <div className="alert alert-info mt-2">
                  Correct answer: {aiAnswer || "Loading..."}
                </div>
              )}
            </>
          )}
          <div className="mt-3 d-flex gap-2">
            {!showedAnswer && result !== "correct" && (
              <button
                className="btn btn-primary"
                onClick={handleCheck}
                disabled={!userAnswer || checking}
              >
                Check Answer
              </button>
            )}
            {!showedAnswer && result !== "correct" && (
              <button
                className="btn btn-outline-secondary"
                onClick={handleShowAnswer}
                disabled={showedAnswer}
              >
                Show Answer
              </button>
            )}
            {(result === "correct" || showedAnswer) && (
              <button className="btn btn-secondary" onClick={handleNext}>
                {current + 1 < questions.length ? "Next Question" : "Finish"}
              </button>
            )}
          </div>
          {result === "correct" && (
            <div className="mt-2 alert alert-success">Correct!</div>
          )}
          {result === "wrong" && (
            <div className="mt-2 alert alert-danger">
              Wrong! Try again or click "Show Answer".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}