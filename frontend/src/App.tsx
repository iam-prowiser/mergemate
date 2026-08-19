import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Questionnaire = lazy(() => import("./pages/Questionnaire"));
const Explore = lazy(() => import("./pages/Explore"));
const Matches = lazy(() => import("./pages/Matches"));
const IssueDetails = lazy(() => import("./pages/IssueDetails"));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* App */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/opportunities" element={<Explore />} />
          <Route path="/issue/:id" element={<IssueDetails />} />
          <Route path="/matches" element={<Matches />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}