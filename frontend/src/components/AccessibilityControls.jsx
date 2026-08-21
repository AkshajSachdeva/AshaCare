import { useLanguage } from "../i18n";

const AccessibilityControls = () => {
    const { preferredLanguage, setPreferredLanguage, textSize, setTextSize, highContrast, setHighContrast, t } = useLanguage();
    return <section aria-label={t.accessibilitySettings} className="space-y-4">
        <div><p className="text-sm font-semibold text-slate-700">{t.language}</p><div className="mt-2 flex gap-2">{["en", "hi"].map((language) => <button key={language} type="button" onClick={() => setPreferredLanguage(language)} aria-pressed={preferredLanguage === language} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${preferredLanguage === language ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{language === "en" ? "English" : "हिंदी"}</button>)}</div></div>
        <div><p className="text-sm font-semibold text-slate-700">{t.textSize}</p><div className="mt-2 flex flex-wrap gap-2">{["small", "medium", "large"].map((size) => <button key={size} type="button" onClick={() => setTextSize(size)} aria-pressed={textSize === size} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${textSize === size ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{t[size]}</button>)}</div></div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="font-semibold text-slate-800">{t.highContrast}</p><p className="text-sm text-slate-600">{t.increaseContrast}</p></div><button type="button" onClick={() => setHighContrast((current) => !current)} aria-pressed={highContrast} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-bold text-white hover:bg-slate-950">{highContrast ? t.on : t.off}</button></div>
    </section>;
};
export default AccessibilityControls;
