import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboardNew";
import TenderDetail from "./components/TenderDetail";
import TenderEdit from "./components/TenderEdit";
import PublicDashboard from "./components/PublicDashboardNew";
import BidTracking from "./components/BidTracking";

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC / LANDING */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tender/:id" element={<TenderDetail />} />
        <Route path="/admin/tender/:id/edit" element={<TenderEdit />} />

        {/* PUBLIC USER DASHBOARD */}
        <Route path="/public" element={<PublicDashboard />} />

        {/* BID TRACKING */}
        <Route
          path="/public/bid/:bidId/tracking"
          element={<BidTracking />}
        />
      </Routes>
    </Router>
  );
}

export default App;
