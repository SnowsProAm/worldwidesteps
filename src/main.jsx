import React, { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
const SchoolChallenge = lazy(() => import('./SchoolChallenge.jsx'));
const InsightsDashboard = lazy(() => import('./InsightsDashboard.jsx'));
const schoolsPage = /^\/schools(?:\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<div role="status" style={{ padding: 32, fontFamily: 'sans-serif', color: '#0a1d44' }}>Loading {schoolsPage ? 'the school challenge' : 'World Wide Steps'}…</div>}>
      {schoolsPage ? <SchoolChallenge /> : <InsightsDashboard />}
    </Suspense>
  </StrictMode>,
);
