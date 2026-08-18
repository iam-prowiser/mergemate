import { BrowserRouter, Routes, Route } from "react-router-dom";

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
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/questionnaire" element={<Questionnaire />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/opportunities" element={<Explore />} />

        <Route path="/issue/:id" element={<IssueDetails />}/>

        <Route path="/matches" element={<Matches />} />
      </Routes>
    </BrowserRouter>
  );
}
