import React, { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import WorldLoading from "./WorldLoading.jsx";
const SchoolChallenge = lazy(() => import('./SchoolChallenge.jsx'));
const InsightsDashboard = lazy(() => import('./InsightsDashboard.jsx'));
const ProAmShop = lazy(() => import('./ProAmShop.jsx'));
const schoolsPage = /^\/schools(?:\/|$)/.test(window.location.pathname);
const shopPage = /^\/shop(?:\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<WorldLoading />}>
      {schoolsPage ? <SchoolChallenge /> : shopPage ? <ProAmShop /> : <InsightsDashboard />}
    </Suspense>
  </StrictMode>,
);
