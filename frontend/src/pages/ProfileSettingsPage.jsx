import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccessibilityControls from "../components/AccessibilityControls";
import { useLanguage } from "../i18n";

const ProfileSettingsPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [currentUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("currentUser")) || null;
        } catch {
            return null;
        }
    });

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    if (!currentUser) {
        return (
            <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">{t.profileUnavailable}</h1>
                    <p className="mt-2 text-slate-600">{t.profileUnavailableDescription}</p>
                    <button type="button" onClick={() => navigate("/login")} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">{t.goToLogin}</button>
                </section>
            </div>
        );
    }

    const area = [currentUser.village || currentUser.block, currentUser.district].filter(Boolean).join(", ");

    return (
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <header>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">{t.workerAccount}</p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">{t.profileSettings}</h1>
            </header>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-800">{currentUser.fullName?.charAt(0) || "A"}</div>
                    <div><h2 className="text-xl font-bold text-slate-900">{currentUser.fullName || t.workerAccount}</h2><p className="text-slate-600">{t.communityWorker}</p></div>
                </div>
                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div><dt className="text-sm font-medium text-slate-500">Phone number</dt><dd className="mt-1 font-semibold text-slate-900">{currentUser.phoneNumber || "Not available"}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500">Email</dt><dd className="mt-1 font-semibold text-slate-900">{currentUser.email || "Not available"}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500">ASHA ID</dt><dd className="mt-1 font-semibold text-slate-900">{currentUser.ashaId || currentUser._id || "Not available"}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500">Village / block / district</dt><dd className="mt-1 font-semibold text-slate-900">{area || "Not available"}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500">Total points</dt><dd className="mt-1 text-2xl font-bold text-emerald-700">{currentUser.totalPoints ?? 0}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500">Language</dt><dd className="mt-1 font-semibold text-slate-900">{currentUser.preferredLanguage === "hi" ? "हिंदी" : "English"}</dd></div>
                </dl>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold text-slate-900">{t.accessibilitySettings}</h2><p className="mt-1 text-slate-600">{t.savedOnDevice}</p><div className="mt-5"><AccessibilityControls /></div></section>
            <button type="button" onClick={logout} className="w-full rounded-xl border border-red-300 bg-white px-5 py-3.5 text-lg font-bold text-red-700 hover:bg-red-50 sm:w-auto">{t.logout}</button>
        </div>
    );
};

export default ProfileSettingsPage;
