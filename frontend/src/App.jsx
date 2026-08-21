import { Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import PatientProfilePage from "./pages/PatientProfilePage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import ScreeningPage from "./pages/ScreeningPage";
import RiskResultPage from "./pages/RiskResultPage";
import ReferralPage from "./pages/ReferralPage";
import AppointmentPage from "./pages/AppointmentPage";
import SchemesPage from "./pages/SchemesPage";
import SchemeDetailsPage from "./pages/SchemeDetailsPage";
import SchemeRegistrationPage from "./pages/SchemeRegistrationPage";
import PatientsPage from "./pages/PatientsPage";
import AddBeneficiaryPage from "./pages/AddBeneficiaryPage";
import FollowUpsPage from "./pages/FollowUpsPage";
import FollowUpDetailPage from "./pages/FollowUpDetailPage";
import RewardsPage from "./pages/RewardsPage";

const App = () => (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/schemes/:schemeId" element={<SchemeDetailsPage />} />
            <Route path="/schemes/:schemeId/register" element={<SchemeRegistrationPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/new" element={<AddBeneficiaryPage />} />
            <Route path="/follow-ups" element={<FollowUpsPage />} />
            <Route path="/follow-ups/:followUpId" element={<FollowUpDetailPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
            <Route path="/settings" element={<ProfileSettingsPage />} />
            <Route path="/patients/:patientId" element={<PatientProfilePage />} />
            <Route path="/cases/:caseId/screening" element={<ScreeningPage />} />
            <Route path="/cases/:caseId/risk" element={<RiskResultPage />} />
            <Route path="/cases/:caseId/referral" element={<ReferralPage />} />
            <Route path="/cases/:caseId/appointment" element={<AppointmentPage />} />
        </Route>
        <Route path="*" element={<p>Page not found</p>} />
    </Routes>
);

export default App;
