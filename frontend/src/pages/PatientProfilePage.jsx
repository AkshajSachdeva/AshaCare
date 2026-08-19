import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCareCase, getPatientById } from "../services/caseApi";

const readableValue = (value) =>
    value ? value.replaceAll("_", " ") : "Not available";

const formatDate = (value) =>
    value
        ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
              new Date(value)
          )
        : "Not available";

const PatientProfilePage = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [isCreatingCase, setIsCreatingCase] = useState(false);

    useEffect(() => {
        const loadPatient = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");
                const response = await getPatientById(patientId);
                setPatient(response.data.patient);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                        "Unable to load the patient profile."
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadPatient();
    }, [patientId]);

    const handleStartScreening = async () => {
        try {
            setErrorMessage("");

            const storedCurrentUser = localStorage.getItem("currentUser");
            const currentUser = storedCurrentUser
                ? JSON.parse(storedCurrentUser)
                : null;
            const areaId = patient?.areaId?._id || patient?.areaId;
            const caseType = patient?.healthCategories?.[0];

            if (!currentUser?._id) {
                setErrorMessage("Your user session is missing. Please sign in again.");
                return;
            }

            if (!areaId) {
                setErrorMessage("This patient does not have an assigned area.");
                return;
            }

            if (!caseType) {
                setErrorMessage(
                    "Add a health category before starting a screening."
                );
                return;
            }

            setIsCreatingCase(true);
            const response = await createCareCase({
                patientId,
                workerId: currentUser._id,
                areaId,
                caseType,
            });
            const careCase = response.data.careCase;
            navigate(`/cases/${careCase._id}/screening`);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                    "Unable to start the screening. Please try again."
            );
        } finally {
            setIsCreatingCase(false);
        }
    };

    if (isLoading) {
        return <p className="p-6 text-lg text-slate-600">Loading...</p>;
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-6">
                <header>
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                        AshaCare
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        Patient Profile
                    </h1>
                </header>

                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {errorMessage}
                    </div>
                )}

                {patient && (
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5 sm:p-7">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {patient.fullName}
                                    </h2>
                                    <p className="mt-1 capitalize text-slate-600">
                                        {patient.age} years · {patient.gender}
                                    </p>
                                </div>
                                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold capitalize text-blue-700">
                                    {readableValue(patient.visitStatus)}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Phone number</p>
                                <p className="mt-1 text-lg text-slate-900">
                                    {patient.phoneNumber || "Not available"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Address</p>
                                <p className="mt-1 text-lg text-slate-900">
                                    {patient.address || "Not available"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Last visit</p>
                                <p className="mt-1 text-lg text-slate-900">
                                    {formatDate(patient.lastVisitDate)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Next visit</p>
                                <p className="mt-1 text-lg text-slate-900">
                                    {formatDate(patient.nextVisitDate)}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm font-medium text-slate-500">
                                    Health categories
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {patient.healthCategories?.length ? (
                                        patient.healthCategories.map((category) => (
                                            <span
                                                key={category}
                                                className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold capitalize text-emerald-700"
                                            >
                                                {readableValue(category)}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-600">
                                            No health categories recorded
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-7">
                            <button
                                type="button"
                                onClick={handleStartScreening}
                                disabled={isCreatingCase}
                                className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-lg font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {isCreatingCase ? "Starting..." : "Start Screening"}
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
};

export default PatientProfilePage;
