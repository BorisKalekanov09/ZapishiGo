import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import TextEditor from "./TextEditor";
import ThemeSwitcher from "./ThemeSwitcher";
import QuizSettings from "./QuizSettings";
import Quiz from "./Quiz";
// import PlansModal from "./PlansModal";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [quizConfig, setQuizConfig] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState(null);

  // Reset quiz state when leaving the quiz page
  useEffect(() => {
    if (activePage !== "quiz") {
      setQuizConfig(null);
      setQuizQuestions(null);
    }
  }, [activePage]);

  return (
    <div className="d-flex">
      <Sidebar
        title={title}
        text={text}
        active={activePage}
        setActive={setActivePage}
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
      </div>
    </div>
  );
}
