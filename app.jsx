import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import TextEditor from "./TextEditor";
import ThemeSwitcher from "./ThemeSwitcher";
import QuizSettings from "./QuizSettings";
import Quiz from "./Quiz";
import LoginSignup from "./LoginSignup/LoginSignup";
import "bootstrap/dist/css/bootstrap.min.css";
import MindMapPage from "./MindMapPage";

export default function App() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [plansModal, setPlansModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleNewProject = () => {
    setTitle("");
    setText("");
  };

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
            onShowPlans={() => {}}
            userName="Test User"
            onSignOut={() => setIsAuthenticated(false)}
            onNewProject={handleNewProject}
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
                userEmail="test@example.com"
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
                }}
              />
            )}
            {activePage === "mindmaps" && (
            <MindMapPage title={title} text={text} />
            )}

          </div>
        </div>
      )}
    </div>
  );
}
