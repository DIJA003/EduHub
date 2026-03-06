import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AcademicYear from "./AcademicYear.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AcademicYear />
  </StrictMode>
);