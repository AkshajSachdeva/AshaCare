import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mockSchemes } from "../mockData/schemes";
import { useLanguage } from "../i18n";

const readableCategory = (category) => category.replaceAll("_", " ");

const SchemesPage = () => {
    const { t } = useLanguage();
    const [patientId] = useState("");
    const [patient] = useState(null);
    const [recommendedSchemes, setRecommendedSchemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Temporary mock data. Later, request schemes using patientId and patient
        // health categories from Punyay's API.
        const loadSchemes = () => {
            setRecommendedSchemes(mockSchemes);
            setIsLoading(false);
        };
        loadSchemes();
    }, [patientId, patient]);

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">{t.patientSupport}</p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">{t.governmentSchemes}</h1>
                <p className="mt-2 text-slate-600">{t.schemesDescription}</p>
            </header>

            {isLoading ? <p className="rounded-xl bg-white p-5 text-slate-600 shadow-sm">{t.loadingSchemes}</p> : recommendedSchemes.length === 0 ? <p className="rounded-xl bg-white p-5 text-slate-600 shadow-sm">{t.noSchemes}</p> : <div className="grid gap-5 md:grid-cols-2">
                {recommendedSchemes.map((scheme) => {
                    const registrations = JSON.parse(localStorage.getItem("mockSchemeRegistrations") || "[]");
                    const registration = registrations.filter((item) => item.schemeId === scheme._id).at(-1);
                    return <article key={scheme._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="text-xl font-bold text-slate-900">{scheme.schemeName}</h2>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${registration ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{registration ? t.registered : t.recommended}</span>
                        </div>
                        <p className="mt-3 text-slate-600">{scheme.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">{scheme.applicableCategories.map((category) => <span key={category} className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold capitalize text-emerald-800">{readableCategory(category)}</span>)}</div>
                        <Link to={`/schemes/${scheme._id}`} className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white hover:bg-emerald-800">{t.viewDetails}</Link>
                    </article>;
                })}
            </div>}
        </div>
    );
};

export default SchemesPage;
