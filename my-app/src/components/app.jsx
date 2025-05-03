import React from "react";
import Sidebar from "./sidebar";
import TextEditor from "./TextEditor";
import ThemeSwitcher from "./ThemeSwitcher";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container-fluid">
        <div className="d-flex justify-content-end p-3">
          <ThemeSwitcher />
        </div>
        <TextEditor />
      </div>
    </div>
  );
}
