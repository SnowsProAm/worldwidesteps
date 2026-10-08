import React, { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import WorldLoading from "./WorldLoading.jsx";
const SchoolChallenge = lazy(() => import('./SchoolChallenge.jsx'));
const InsightsDashboard = lazy(() => import('./InsightsDashboard.jsx'));
const schoolsPage = /^\/schools(?:\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={schoolsPage ? <div role="status" style={{ padding: 32, fontFamily: 'sans-serif', color: '#0a1d44' }}>Loading the school challenge…</div> : <WorldLoading />}>
      {schoolsPage ? <SchoolChallenge /> : <InsightsDashboard />}
    </Suspense>
  </StrictMode>,
);
