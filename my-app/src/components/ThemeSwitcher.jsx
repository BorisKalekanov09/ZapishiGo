import React, { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("bsTheme")
      ? localStorage.getItem("bsTheme") === "dark"
      : prefersDark
  );

  useEffect(() => {
    const html = document.documentElement;
    const theme = darkMode ? "dark" : "light";
    html.setAttribute("data-bs-theme", theme);
    localStorage.setItem("bsTheme", theme);
  }, [darkMode]);

  useEffect(() => {
    // Enable Bootstrap tooltip
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((el) => {
      if (window.bootstrap && window.bootstrap.Tooltip) {
        new window.bootstrap.Tooltip(el);
      }
    });
  }, []);

  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        id="darkModeSwitch"
        checked={darkMode}
        aria-label="Switch between light and dark mode"
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="Switch between light and dark mode"
        onChange={() => setDarkMode((prev) => !prev)}
      />
    </div>
  );
}
