import React, { useState } from "react";

export default function TextEditor() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (option) => {
    setSelectedOption(option);
    setShowMenu(false);
  };

  const handleContinue = () => {
    alert(`Title: ${title}\nOption: ${selectedOption}\nText: ${text}`);
    // Place your AI logic here
  };

  return (
    <div className="card mt-4">
      <div className="card-header">Text Editor</div>
      <div className="card-body">
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
          placeholder="Type your text here..."
        />
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
                  onClick={() => handleMenuClick("End of sentence")}
                >
                  End of sentence
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuClick("End of paragraph")}
                >
                  End of paragraph
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuClick("Complete whole text")}
                >
                  Complete whole text
                </button>
              </li>
            </ul>
          </div>
          <button
            className="btn btn-primary"
            disabled={!selectedOption}
            onClick={handleContinue}
          >
            Continue text with AI
          </button>
        </div>
      </div>
    </div>
  );
}
