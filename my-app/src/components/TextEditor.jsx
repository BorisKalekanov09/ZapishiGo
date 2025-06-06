import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function TextEditor({
  title,
  setTitle,
  text,
  setText,
  userEmail,
}) {
  const [selectedOption, setSelectedOption] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [pendingOutput, setPendingOutput] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
const [error, setError] = useState("");
  const handleMenuClick = (option) => {
    setSelectedOption(option);
    setShowMenu(false);
  };

  const apiKey = process.env.REACT_APP_APIKEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


const DownloadButton = ({ title, text, onError }) => {
  const handleDownload = () => {
    if (!title || !text) {
      onError("Please enter a title and some text before downloading.");
      return;
    }

    const content = `Title: ${title}\n\n${text}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <button className="btn btn-primary" type="button" onClick={handleDownload}>
      Download Plan
    </button>
  );
};


  const handleContinue = async (e) => {
    e.preventDefault();
    try {
      const prompt = `Continue the following text appropriately. Use this guidance (do not say it in the fial answer): "${selectedOption}". Do not mention the instruction or that you're an AI — just continue the writing:\n\n${text}\n\n let the answer be only the new part that you add dont put ... to show that there is tex before ,and also please dont say the guidance thanks`;

      const result = await model.generateContent(prompt);

      const response = await result.response;
      const output =
        typeof response.text === "function"
          ? await response.text()
          : response.text;
      setPendingOutput(output);
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && pendingOutput) {
      e.preventDefault();
      setText((prev) => prev + " " + pendingOutput);
      setPendingOutput("");
    }
  };


const savePlan = async (title, text) => {
  try {
    const res = await fetch("http://localhost:8080/api/saveplan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, email: userEmail }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to save plan");
      return false;
    }

    return true;
  } catch (error) {
    setError("Network error while saving plan");
    return false;
  }
};

const handleSavePlan = async () => {
  setError("");

  if (!title || !text || !userEmail) {
    setError("Please enter a title, some text and be logged in before saving.");
    return;
  }

  const success = await savePlan(title, text);

  if (success) {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  }
};

  return (
    <div className="card mt-4 position-relative">
      <div
        className={`position-absolute start-50 translate-middle-x px-4 py-2 rounded bg-success text-white shadow
          ${showSaved ? "fade-in" : "fade-out"}`}
        style={{
          top: "-50px",
          left: "50%",
          zIndex: 10,
          opacity: showSaved ? 1 : 0,
          pointerEvents: "none",
          transition: "opacity 1s",
        }}
      >
        Plan was saved!
      </div>
      <div
        className={`position-absolute start-50 translate-middle-x px-4 py-2 rounded bg-danger text-white shadow
          ${showDuplicate ? "fade-in" : "fade-out"}`}
        style={{
          top: "-50px",
          left: "50%",
          zIndex: 10,
          opacity: showDuplicate ? 1 : 0,
          pointerEvents: "none",
          transition: "opacity 1s",
        }}
      >
        Plan already exists!
      </div>
      <div className="card-header">Text Editor</div>
      <div className="card-body">
        <form onSubmit={handleContinue}>
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-3"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your text here..."
          />
          {pendingOutput && (
            <div style={{ color: "red", marginBottom: "1rem" }}>
              Suggested by AI: {pendingOutput}
              <br />
              <strong>Press Enter to accept</strong>
            </div>
          )}
          <div className="d-flex align-items-center gap-2">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                aria-expanded={showMenu}
              >
                {selectedOption || "Choose AI option"}
              </button>
              <ul
                className={`dropdown-menu${showMenu ? " show" : ""}`}
                style={{ minWidth: "220px" }}
              >
                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleMenuClick("End of sentence")}
                  >
                    End of sentence
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleMenuClick("End of paragraph")}
                  >
                    End of paragraph
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleMenuClick("Complete whole text")}
                  >
                    Complete whole text
                  </button>
                </li>
              </ul>
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!selectedOption}
            >
              Continue text with AI
            </button>
            <button
              className="btn btn-success"
              type="button"
              onClick={handleSavePlan}
            >
              Save Plan
            </button>
             <DownloadButton title={title} text={text} onError={setError} />
          </div>
        </form>
      </div>
    </div>
  );
}
