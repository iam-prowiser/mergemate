import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Questionnaire from "./pages/Questionnaire";
import Explore from "./pages/Explore";
import Matches from "./pages/Matches";
import IssueDetails from "./pages/IssueDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/questionnaire" element={<Questionnaire />} />

        {/* Application */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/opportunities" element={<Explore />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/issue/:id" element={<IssueDetails />} />
      </Routes>
    </BrowserRouter>
  );
}