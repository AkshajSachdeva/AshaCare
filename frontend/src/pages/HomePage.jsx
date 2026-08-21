import { Link } from "react-router-dom";
import { useLanguage } from "../i18n";

const HomePage = () => {
    const { t } = useLanguage();
    return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-emerald-700 p-6 text-white shadow-sm sm:p-9">
            <p className="font-semibold text-emerald-100">AshaCare</p>
            <h1 className="mt-2 text-3xl font-bold">{t.homeTitle}</h1>
            <p className="mt-3 max-w-2xl text-emerald-50">{t.homeDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link to="/schemes" className="rounded-xl bg-white px-5 py-3 font-bold text-emerald-800">{t.viewSchemes}</Link><Link to="/profile" className="rounded-xl border border-emerald-300 px-5 py-3 font-bold text-white">{t.myProfile}</Link></div>
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold text-slate-900">{t.patientWorkflow}</h2><p className="mt-2 text-slate-600">{t.patientWorkflowDescription}</p></section>
    </div>
    );
};

export default HomePage;
