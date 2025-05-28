import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import TextEditor from "./TextEditor";
import ThemeSwitcher from "./ThemeSwitcher";
import QuizSettings from "./QuizSettings";
import Quiz from "./Quiz";
import PlansModal from "./PlansModal";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [quizConfig, setQuizConfig] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [plansModal, setPlansModal] = useState(false);
  const [plans, setPlans] = useState([]);

  // Reset quiz state when leaving the quiz page
  useEffect(() => {
    if (activePage !== "quiz") {
      setQuizConfig(null);
      setQuizQuestions(null);
    }
  }, [activePage]);

  // Load plans from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("plans") || "[]");
    setPlans(saved);
  }, []);

  // Save plan (call this when user wants to save current plan)
  const saveCurrentPlan = () => {
    // Check for duplicate
    const exists = plans.some(
      (plan) => plan.title === title && plan.text === text
    );
    if (exists) {
      return false; // Not saved, duplicate
    }
    const newPlans = [...plans, { title, text }];
    setPlans(newPlans);
    localStorage.setItem("plans", JSON.stringify(newPlans));
    return true; // Saved
  };

  // Load plan (set title and text)
  const handleLoadPlan = (plan) => {
    setTitle(plan.title);
    setText(plan.text);
    setPlansModal(false);
    setActivePage("home");
  };

  const handleDeletePlan = (idx) => {
    const newPlans = plans.filter((_, i) => i !== idx);
    setPlans(newPlans);
    localStorage.setItem("plans", JSON.stringify(newPlans));
  };

  // Pass this to Sidebar
  const handleShowPlans = () => setPlansModal(true);

  return (
    <div className="d-flex">
      <Sidebar
        title={title}
        text={text}
        active={activePage}
        setActive={setActivePage}
        onShowPlans={handleShowPlans}
      />
      <div className="container-fluid">
        <div className="d-flex justify-content-end p-3">
          <ThemeSwitcher />
        </div>
        {activePage === "home" && (
          <TextEditor
            title={title}
            setTitle={setTitle}
            text={text}
            setText={setText}
            saveCurrentPlan={saveCurrentPlan} // <-- pass this prop
          />
        )}
        {activePage === "quiz" && !quizQuestions && (
          <QuizSettings
            onStart={async (settings) => {
              // Call AI to generate questions here
              // Pass title, text, and settings
              const questions = await generateQuizQuestions({
                ...settings,
                title,
                text,
              });
              setQuizQuestions(questions);
            }}
            title={title}
            text={text}
          />
        )}
        {activePage === "quiz" && quizQuestions && (
          <Quiz
            questions={quizQuestions}
            text={text}
            onFinish={() => {
              setQuizQuestions(null);
              setQuizConfig(null);
            }}
          />
        )}
        <PlansModal
          show={plansModal}
          onHide={() => setPlansModal(false)}
          plans={plans}
          onLoad={handleLoadPlan}
          onDelete={handleDeletePlan}
        />
      </div>
    </div>
  );
}

// Helper function to generate quiz questions using AI
async function generateQuizQuestions({ numQuestions, types, title, text }) {
  // You can use your AI API here. This is a placeholder for the prompt logic.
  // For demo, let's assume you use GoogleGenerativeAI as in your TextEditor.
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.REACT_APP_APIKEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Calculate how many open/multiple questions
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

  // Build prompt for AI
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

  // Try to parse JSON from AI output
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
