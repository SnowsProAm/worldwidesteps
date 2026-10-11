import React, { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import WorldLoading from "./WorldLoading.jsx";
const SchoolChallenge = lazy(() => import('./SchoolChallenge.jsx'));
const InsightsDashboard = lazy(() => import('./InsightsDashboard.jsx'));
const schoolsPage = /^\/schools(?:\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<WorldLoading />}>
      {schoolsPage ? <SchoolChallenge /> : <InsightsDashboard />}
    </Suspense>
  </StrictMode>,
);
