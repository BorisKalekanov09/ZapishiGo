import React, { useState, useEffect } from "react";
import LoginSignup from "./LoginSignup/LoginSignup";
import Sidebar from "./sidebar";
import TextEditor from "./TextEditor";
import ThemeSwitcher from "./ThemeSwitcher";
import QuizSettings from "./QuizSettings";
import Quiz from "./Quiz";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [plansModal, setPlansModal] = useState(false);
  const [plans, setPlans] = useState([]);


    const handleNewProject = () => {
    setTitle("");
    setText("");
  };

  useEffect(() => {
    const savedUserString = localStorage.getItem("user");
    if (savedUserString) {
      try {
        const savedUser = JSON.parse(savedUserString);
        if (savedUser && savedUser.name && savedUser.email) {
          setUserName(savedUser.name);
          setUserEmail(savedUser.email);
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
        setUserName("");
        setUserEmail("");
      }
    }
  }, []);

  const handleLogin = () => {
    const savedUserString = localStorage.getItem("user");
    if (savedUserString) {
      try {
        const savedUser = JSON.parse(savedUserString);
        if (savedUser && savedUser.name && savedUser.email) {
          setUserName(savedUser.name);
          setUserEmail(savedUser.email);
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
        setUserName("");
        setUserEmail("");
      }
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserName("");
    setUserEmail("");
  };

  const handleShowPlans = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/getplans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        alert("Failed to fetch plans");
        return;
      }

      const data = await response.json();
      setPlans(data.plans || []);
      setPlansModal(true);
    } catch (err) {
      console.error(err);
      alert("Error fetching plans");
    }
  };

  const handleSelectPlan = (plan) => {
    setTitle(plan.title);
    setText(plan.text);
    setPlansModal(false);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <LoginSignup onLogin={handleLogin} />
      ) : (
        <div className="d-flex">
          <Sidebar
            title={title}
            text={text}
            active={activePage}
            setActive={setActivePage}
            onShowPlans={handleShowPlans}
            userName={userName}
            onSignOut={handleSignOut}
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
                userEmail={userEmail}
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

            {/* Plans Modal */}
            <Modal show={plansModal} onHide={() => setPlansModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Select a Plan</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {plans.length === 0 ? (
                  <p>No plans found.</p>
                ) : (
                  <ul className="list-group">
                    {plans.map((plan, index) => (
                      <li
                        key={index}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        {plan.title}
                      </li>
                    ))}
                  </ul>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setPlansModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}
