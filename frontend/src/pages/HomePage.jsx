import { Link } from "react-router-dom";
import { useLanguage } from "../i18n";

const HomePage = () => {
    const { preferredLanguage, setPreferredLanguage, t } = useLanguage();
    let currentUser = null;
    try { currentUser = JSON.parse(localStorage.getItem("currentUser") || "null"); } catch { currentUser = null; }
    const todayVisits = 3;
    const pendingFollowUps = 5;
    const totalPoints = currentUser?.totalPoints ?? 15;
    const villageWard = currentUser?.village || currentUser?.ward || currentUser?.block || t.notAvailable;
    const actionClass = "flex min-h-36 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

    return (
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
            <section className="rounded-3xl bg-emerald-700 p-5 text-white shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="font-semibold text-emerald-100">AshaCare</p><h1 className="mt-2 text-3xl font-bold">{t.welcomeBack}, {currentUser?.fullName || "ASHA Worker"}</h1><p className="mt-2 text-emerald-50">{t.villageWard}: {villageWard}</p></div>
                    <div className="flex flex-wrap items-center gap-2"><div className="rounded-xl bg-emerald-800/60 p-1" aria-label={t.dashboardLanguage}>{["en", "hi"].map((language) => <button key={language} type="button" onClick={() => setPreferredLanguage(language)} aria-pressed={preferredLanguage === language} className={`rounded-lg px-3 py-2 text-sm font-bold ${preferredLanguage === language ? "bg-white text-emerald-800" : "text-white hover:bg-emerald-600"}`}>{language === "en" ? "English" : "हिंदी"}</button>)}</div><Link to="/profile" className="rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600">{t.profile}</Link></div>
                </div>
            </section>

            <section className="mt-6" aria-label="Dashboard statistics">
                <div className="grid gap-4 sm:grid-cols-3">
                    {[{ label: t.todayVisits, value: todayVisits, accent: "text-emerald-700" }, { label: t.pendingFollowUps, value: pendingFollowUps, accent: "text-amber-700" }, { label: t.totalPoints, value: totalPoints, accent: "text-violet-700" }].map((stat) => <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-base font-semibold text-slate-600">{stat.label}</p><p className={`mt-2 text-4xl font-bold ${stat.accent}`}>{stat.value}</p></article>)}
                </div>
            </section>

            <section className="mt-7">
                <h2 className="text-2xl font-bold text-slate-900">{t.homeTitle}</h2>
                <p className="mt-1 text-slate-600">{t.homeDescription}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className={`${actionClass} cursor-not-allowed bg-slate-50 opacity-80`} aria-disabled="true"><span className="text-2xl" aria-hidden="true">＋</span><h3 className="mt-3 text-xl font-bold text-slate-900">{t.newVisitScreening}</h3><p className="mt-1 text-slate-600">{t.visitActionDescription}</p><span className="mt-auto pt-4 text-sm font-bold text-slate-500">{t.comingSoon}</span></div>
                    <Link to="/follow-ups" className={actionClass} aria-label={t.followUps}><span className="text-2xl" aria-hidden="true">↻</span><h3 className="mt-3 text-xl font-bold text-slate-900">{t.followUps}</h3><p className="mt-1 text-slate-600">{t.followUpActionDescription}</p><span className="mt-auto pt-4 font-bold text-emerald-700">{t.viewDetails} →</span></Link>
                    <Link to="/schemes" className={actionClass} aria-label={t.myRegistrations}><span className="text-2xl" aria-hidden="true">✓</span><h3 className="mt-3 text-xl font-bold text-slate-900">{t.myRegistrations}</h3><p className="mt-1 text-slate-600">{t.registrationActionDescription}</p><span className="mt-auto pt-4 font-bold text-emerald-700">{t.viewSchemes} →</span></Link>
                    <Link to="/rewards" className={actionClass} aria-label={t.rewardsPoints}><span className="text-2xl" aria-hidden="true">★</span><h3 className="mt-3 text-xl font-bold text-slate-900">{t.rewardsPoints}</h3><p className="mt-1 text-slate-600">{t.pointsActionDescription}</p><span className="mt-auto pt-4 font-bold text-emerald-700">{t.viewDetails} →</span></Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
