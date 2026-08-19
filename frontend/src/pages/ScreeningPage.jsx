import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCareCaseById, submitScreening } from "../services/caseApi";

const initialFormData = {
    symptoms: [],
    bloodPressure: {
        systolic: "",
        diastolic: "",
    },
    bloodSugarMgDl: "",
    temperatureCelsius: "",
    weightKg: "",
    pregnancy: {
        isPregnant: false,
        pregnancyWeeks: "",
        dangerSigns: [],
    },
    tuberculosis: {
        coughDurationWeeks: "",
        feverPresent: false,
        nightSweatsPresent: false,
        weightLossPresent: false,
    },
    notes: "",
};

const numberOrNull = (value) =>
    value === "" || value === null || value === undefined ? null : Number(value);

const fieldClassName =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const ScreeningPage = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [careCase, setCareCase] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadCareCase = async () => {
            try {
                setIsLoading(true);
                const response = await getCareCaseById(caseId);
                setCareCase(response.data.careCase);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message || "Unable to load the care case."
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadCareCase();
    }, [caseId]);

    const setTopLevelField = (field, value) => {
        setFormData((current) => ({ ...current, [field]: value }));
    };

    const setNestedField = (section, field, value) => {
        setFormData((current) => ({
            ...current,
            [section]: { ...current[section], [field]: value },
        }));
    };

    const toggleDangerSign = (dangerSign) => {
        const dangerSigns = formData.pregnancy.dangerSigns.includes(dangerSign)
            ? formData.pregnancy.dangerSigns.filter((item) => item !== dangerSign)
            : [...formData.pregnancy.dangerSigns, dangerSign];
        setNestedField("pregnancy", "dangerSigns", dangerSigns);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const symptomValues = Array.isArray(formData.symptoms)
            ? formData.symptoms
            : formData.symptoms.split(",");

        const screeningData = {
            ...formData,
            symptoms: symptomValues
                .map((symptom) => symptom.trim())
                .filter(Boolean),
            bloodPressure: {
                systolic: numberOrNull(formData.bloodPressure.systolic),
                diastolic: numberOrNull(formData.bloodPressure.diastolic),
            },
            bloodSugarMgDl: numberOrNull(formData.bloodSugarMgDl),
            temperatureCelsius: numberOrNull(formData.temperatureCelsius),
            weightKg: numberOrNull(formData.weightKg),
            pregnancy: {
                ...formData.pregnancy,
                pregnancyWeeks: numberOrNull(
                    formData.pregnancy.pregnancyWeeks
                ),
            },
            tuberculosis: {
                ...formData.tuberculosis,
                coughDurationWeeks: numberOrNull(
                    formData.tuberculosis.coughDurationWeeks
                ),
            },
        };

        try {
            setIsSubmitting(true);
            setErrorMessage("");
            await submitScreening(caseId, screeningData);
            navigate(`/cases/${caseId}/risk`);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                    "Unable to submit the screening. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="p-6 text-lg text-slate-600">Loading...</p>;
    }

    const readableCaseType = careCase?.caseType?.replaceAll("_", " ");
    const dangerSignOptions = [
        "bleeding",
        "severe_headache",
        "swelling",
        "severe_abdominal_pain",
    ];

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <header className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                        {readableCaseType || "Care case"}
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        Health Screening
                    </h1>
                </header>

                {errorMessage && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {errorMessage}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                >
                    <section className="grid gap-5 sm:grid-cols-2">
                        <label className="sm:col-span-2 font-semibold text-slate-800">
                            Symptoms
                            <input
                                type="text"
                                value={
                                    Array.isArray(formData.symptoms)
                                        ? formData.symptoms.join(", ")
                                        : formData.symptoms
                                }
                                onChange={(event) =>
                                    setTopLevelField("symptoms", event.target.value)
                                }
                                placeholder="dizziness, headache"
                                className={fieldClassName}
                            />
                            <span className="mt-1 block text-sm font-normal text-slate-500">
                                Separate multiple symptoms with commas.
                            </span>
                        </label>

                        <label className="font-semibold text-slate-800">
                            Weight (kg)
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.weightKg}
                                onChange={(event) =>
                                    setTopLevelField("weightKg", event.target.value)
                                }
                                className={fieldClassName}
                            />
                        </label>

                        <label className="font-semibold text-slate-800">
                            Temperature (°C)
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.temperatureCelsius}
                                onChange={(event) =>
                                    setTopLevelField(
                                        "temperatureCelsius",
                                        event.target.value
                                    )
                                }
                                className={fieldClassName}
                            />
                        </label>
                    </section>

                    <section className="rounded-2xl bg-slate-50 p-4 sm:p-5">
                        <h2 className="text-lg font-bold text-slate-900">Blood pressure</h2>
                        <div className="mt-4 grid gap-5 sm:grid-cols-2">
                            <label className="font-semibold text-slate-800">
                                Systolic BP
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.bloodPressure.systolic}
                                    onChange={(event) =>
                                        setNestedField(
                                            "bloodPressure",
                                            "systolic",
                                            event.target.value
                                        )
                                    }
                                    className={fieldClassName}
                                />
                            </label>
                            <label className="font-semibold text-slate-800">
                                Diastolic BP
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.bloodPressure.diastolic}
                                    onChange={(event) =>
                                        setNestedField(
                                            "bloodPressure",
                                            "diastolic",
                                            event.target.value
                                        )
                                    }
                                    className={fieldClassName}
                                />
                            </label>
                        </div>
                    </section>

                    {(careCase?.caseType === "diabetes" ||
                        careCase?.caseType === "blood_pressure") && (
                        <label className="block font-semibold text-slate-800">
                            Blood Sugar (mg/dL)
                            <input
                                type="number"
                                min="0"
                                value={formData.bloodSugarMgDl}
                                onChange={(event) =>
                                    setTopLevelField(
                                        "bloodSugarMgDl",
                                        event.target.value
                                    )
                                }
                                className={fieldClassName}
                            />
                        </label>
                    )}

                    {careCase?.caseType === "pregnancy" && (
                        <section className="space-y-5 rounded-2xl bg-rose-50 p-4 sm:p-5">
                            <h2 className="text-lg font-bold text-slate-900">
                                Pregnancy details
                            </h2>
                            <label className="flex items-center gap-3 font-semibold text-slate-800">
                                <input
                                    type="checkbox"
                                    checked={formData.pregnancy.isPregnant}
                                    onChange={(event) =>
                                        setNestedField(
                                            "pregnancy",
                                            "isPregnant",
                                            event.target.checked
                                        )
                                    }
                                    className="h-5 w-5 rounded border-slate-300 text-emerald-700"
                                />
                                Currently Pregnant?
                            </label>
                            <label className="block font-semibold text-slate-800">
                                Pregnancy Weeks
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.pregnancy.pregnancyWeeks}
                                    onChange={(event) =>
                                        setNestedField(
                                            "pregnancy",
                                            "pregnancyWeeks",
                                            event.target.value
                                        )
                                    }
                                    className={fieldClassName}
                                />
                            </label>
                            <fieldset>
                                <legend className="font-semibold text-slate-800">
                                    Danger Signs
                                </legend>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {dangerSignOptions.map((dangerSign) => (
                                        <label
                                            key={dangerSign}
                                            className="flex items-center gap-3 rounded-xl bg-white p-3 text-slate-700"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.pregnancy.dangerSigns.includes(
                                                    dangerSign
                                                )}
                                                onChange={() =>
                                                    toggleDangerSign(dangerSign)
                                                }
                                                className="h-5 w-5 rounded border-slate-300 text-emerald-700"
                                            />
                                            <span className="capitalize">
                                                {dangerSign.replaceAll("_", " ")}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        </section>
                    )}

                    {careCase?.caseType === "tuberculosis" && (
                        <section className="space-y-5 rounded-2xl bg-amber-50 p-4 sm:p-5">
                            <h2 className="text-lg font-bold text-slate-900">
                                Tuberculosis screening details
                            </h2>
                            <label className="block font-semibold text-slate-800">
                                Cough Duration (weeks)
                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        formData.tuberculosis.coughDurationWeeks
                                    }
                                    onChange={(event) =>
                                        setNestedField(
                                            "tuberculosis",
                                            "coughDurationWeeks",
                                            event.target.value
                                        )
                                    }
                                    className={fieldClassName}
                                />
                            </label>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    ["feverPresent", "Fever"],
                                    ["nightSweatsPresent", "Night Sweats"],
                                    ["weightLossPresent", "Weight Loss"],
                                ].map(([field, label]) => (
                                    <label
                                        key={field}
                                        className="flex items-center gap-3 rounded-xl bg-white p-3 font-semibold text-slate-800"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.tuberculosis[field]}
                                            onChange={(event) =>
                                                setNestedField(
                                                    "tuberculosis",
                                                    field,
                                                    event.target.checked
                                                )
                                            }
                                            className="h-5 w-5 rounded border-slate-300 text-emerald-700"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}

                    <label className="block font-semibold text-slate-800">
                        Notes
                        <textarea
                            rows="4"
                            value={formData.notes}
                            onChange={(event) =>
                                setTopLevelField("notes", event.target.value)
                            }
                            className={fieldClassName}
                            placeholder="Add screening observations"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-lg font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Screening"}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default ScreeningPage;
