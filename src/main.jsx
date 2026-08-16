import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = document.getElementById("root");
if (!root) {
  console.error("Root element not found!");
  throw new Error('Root element with id "root" not found in HTML');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
