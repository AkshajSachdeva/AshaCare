import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n";

const onboardingSteps = [
    { title: "Record patient visits easily", description: "Keep the important details from every patient visit in one clear place." },
    { title: "Identify health risks", description: "Use simple screening information to understand when a patient needs attention." },
    { title: "Connect patients with schemes and follow-ups", description: "Help patients access support and remember what needs to happen next." },
];

const OnboardingPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const step = [{ title: t.onboarding1Title, description: t.onboarding1Description }, { title: t.onboarding2Title, description: t.onboarding2Description }, { title: t.onboarding3Title, description: t.onboarding3Description }][currentStep];
    const isLastStep = currentStep === onboardingSteps.length - 1;

    const continueOnboarding = () => {
        if (isLastStep) {
            navigate("/login");
            return;
        }
        setCurrentStep((current) => current + 1);
    };

    return (
        <main className="grid min-h-screen place-items-center bg-emerald-50 px-4 py-8">
            <section className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-sm sm:p-10">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">AshaCare</p>
                <div className="mx-auto mt-8 grid h-28 w-28 place-items-center rounded-full bg-emerald-100 text-4xl" aria-hidden="true">❤</div>
                <p className="mt-8 text-sm font-semibold text-emerald-700">{t.step} {currentStep + 1} {t.of} {onboardingSteps.length}</p>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">{step.title}</h1>
                <p className="mt-4 text-lg leading-7 text-slate-600">{step.description}</p>
                <div className="mt-8 flex justify-center gap-2" aria-label={`${t.step} ${currentStep + 1} ${t.of} ${onboardingSteps.length}`}>
                    {onboardingSteps.map((_, index) => <span key={index} className={`h-2.5 rounded-full ${index === currentStep ? "w-8 bg-emerald-700" : "w-2.5 bg-emerald-200"}`} />)}
                </div>
                <button type="button" onClick={continueOnboarding} className="mt-9 w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-lg font-bold text-white hover:bg-emerald-800">
                    {isLastStep ? t.getStarted : t.continue}
                </button>
                {!isLastStep && <button type="button" onClick={() => navigate("/login")} className="mt-4 text-sm font-semibold text-slate-600 underline">{t.skip}</button>}
            </section>
        </main>
    );
};

export default OnboardingPage;
