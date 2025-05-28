// src/components/Sidebar.jsx
import React from "react";
import "./sidebar.css";

export default function Sidebar({
  title,
  text,
  active,
  setActive,
  onShowPlans,
}) {
  const isDisabled = !title || !text;

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 min-vh-100 bg-body-secondary"
      style={{ width: "280px" }}
    >
      <a
        href="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none text-body"
      >
        <svg className="bi me-2" width="40" height="32">
          <use xlinkHref="#bootstrap"></use>
        </svg>
        <span className="fs-4">ZapishiGo</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <button
            className={`nav-link ${active === "home" ? "active" : ""}`}
            aria-current={active === "home" ? "page" : undefined}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              color: "inherit",
            }}
            onClick={() => setActive("home")}
          >
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="#home"></use>
            </svg>
            Home
          </button>
        </li>
        <li>
          <button
            className={`nav-link ${active === "mindmaps" ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              color: "inherit",
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? "none" : "auto",
            }}
            onClick={() => setActive("mindmaps")}
            disabled={isDisabled}
          >
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="#speedometer2"></use>
            </svg>
            Mind Maps
          </button>
        </li>
        <li>
          <button
            className={`nav-link ${active === "quiz" ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              color: "inherit",
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? "none" : "auto",
            }}
            onClick={() => setActive("quiz")}
            disabled={isDisabled}
          >
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="#table"></use>
            </svg>
            Quiz
          </button>
        </li>
      </ul>
      <hr />
      <div className="dropdown">
        <a
          href="#"
          className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
          id="dropdownUser1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src="https://github.com/mdo.png"
            alt=""
            width="32"
            height="32"
            className="rounded-circle me-2"
          />
          <strong>mdo</strong>
        </a>
        <ul
          className="dropdown-menu dropdown-menu-dark text-small shadow"
          aria-labelledby="dropdownUser1"
        >
          <li>
            <a className="dropdown-item" href="#">
              New project...
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Settings
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Profile
            </a>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Sign out
            </a>
          </li>
          <li>
            <button
              className="dropdown-item"
              type="button"
              onClick={onShowPlans}
            >
              Show plans
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
