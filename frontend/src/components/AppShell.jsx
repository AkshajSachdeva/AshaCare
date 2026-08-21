import { NavLink, Outlet, useNavigate } from "react-router-dom";
import AccessibilityControls from "./AccessibilityControls";
import ConnectionStatus from "./ConnectionStatus";
import { useLanguage } from "../i18n";

const AppShell = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const navigationItems = [{ label: t.home, to: "/" }, { label: t.schemes, to: "/schemes" }, { label: t.profile, to: "/profile" }];
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
        currentUser = null;
    }

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <a href="#main-content" className="skip-link">{t.skipToContent}</a>
            <header className="border-b border-emerald-100 bg-white shadow-sm">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <NavLink to="/" className="flex items-center gap-2 font-bold text-emerald-800">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-lg text-white">A</span>
                        <span>AshaCare</span>
                    </NavLink>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <ConnectionStatus />
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            {currentUser?.fullName || t.profile}
                        </button>
                    </div>
                </div>
                <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={({ isActive }) =>
                                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                                    isActive
                                        ? "bg-emerald-700 text-white"
                                        : "text-slate-700 hover:bg-emerald-50"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <span title={t.patientListNote} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-400">
                        {t.patients}
                    </span>
                    <span title={t.rewardsNote} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-400">
                        {t.rewards}
                    </span>
                </div>
            </header>

            <main id="main-content">
                <Outlet />
            </main>

            <footer className="border-t border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-sm text-slate-600">{t.appFooter}</p>
                    <details className="w-full sm:max-w-md">
                        <summary className="cursor-pointer font-semibold text-emerald-800">{t.accessibilitySettings}</summary>
                        <div className="mt-3 rounded-xl border border-slate-200 p-4">
                            <AccessibilityControls />
                        </div>
                    </details>
                    {currentUser && (
                        <button type="button" onClick={logout} className="w-fit text-sm font-semibold text-red-700 underline">
                            {t.logout}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default AppShell;
