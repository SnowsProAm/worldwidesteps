import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import InsightsDashboard from "./InsightsDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <InsightsDashboard />
  </StrictMode>,
);
