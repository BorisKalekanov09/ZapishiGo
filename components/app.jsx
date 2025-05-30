import React, { useState, useEffect } from "react";
import LoginSignup from "./LoginSignup/LoginSignup";
import Sidebar from "./sidebar";
import TextEditor from "./TextEditor";
import ThemeSwitcher from "./ThemeSwitcher";
import QuizSettings from "./QuizSettings";
import Quiz from "./Quiz";
// import PlansModal from "./PlansModal"; // Uncomment when implemented
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const handleShowPlans = () => setPlansModal(true);

  return (
    <div>
      {!isAuthenticated ? (
        <LoginSignup onLogin={() => setIsAuthenticated(true)} />
      ) : (
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
                saveCurrentPlan={saveCurrentPlan}
              />
            )}
            {activePage === "quiz" && !quizQuestions && (
              <QuizSettings
                onQuizGenerated={(questions) => setQuizQuestions(questions)}
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
            {/* Uncomment and implement PlansModal when ready
            <PlansModal
              show={plansModal}
              onHide={() => setPlansModal(false)}
              plans={plans}
              onLoad={handleLoadPlan}
              onDelete={handleDeletePlan}
            />
            */}
          </div>
        </div>
      )}
    </div>
  );
}
