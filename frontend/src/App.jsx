import { Route, Routes } from "react-router-dom";
import PatientProfilePage from "./pages/PatientProfilePage";
import ScreeningPage from "./pages/ScreeningPage";
import RiskResultPage from "./pages/RiskResultPage";
import ReferralPage from "./pages/ReferralPage";
import AppointmentPage from "./pages/AppointmentPage";

const App = () => (
    <Routes>
        <Route path="/" element={<p>AshaCare frontend is running.</p>} />
        <Route path="/patients/:patientId" element={<PatientProfilePage />} />
        <Route path="/cases/:caseId/screening" element={<ScreeningPage />} />
        <Route path="/cases/:caseId/risk" element={<RiskResultPage />} />
        <Route path="/cases/:caseId/referral" element={<ReferralPage />} />
        <Route
            path="/cases/:caseId/appointment"
            element={<AppointmentPage />}
        />
        <Route path="*" element={<p>Page not found</p>} />
    </Routes>
);

export default App;
