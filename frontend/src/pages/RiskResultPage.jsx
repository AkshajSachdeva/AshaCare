import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RiskBadge from "../components/RiskBadge";
import { getCareCaseById } from "../services/caseApi";

const actionLabels = {
    routine_care: "Routine care",
    revisit: "Revisit",
    doctor_visit: "Doctor visit",
    urgent_referral: "Urgent referral",
};

const RiskResultPage = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [careCase, setCareCase] = useState(null);
    const [riskAssessment, setRiskAssessment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadCareCase = async () => {
            try {
                setIsLoading(true);
                const response = await getCareCaseById(caseId);
                setCareCase(response.data.careCase);
                setRiskAssessment(response.data.careCase.riskAssessment);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                        "Unable to load the risk assessment."
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadCareCase();
    }, [caseId]);

    if (isLoading) {
        return <p className="p-6 text-lg text-slate-600">Loading...</p>;
    }

    const patientId = careCase?.patientId?._id || careCase?.patientId;
    const needsReferral = ["yellow", "red"].includes(
        riskAssessment?.riskLevel
    );

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
                <header>
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                        Screening-based risk assessment
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        Risk Assessment
                    </h1>
                </header>

                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {errorMessage}
                    </div>
                )}

                {riskAssessment && (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Risk level
                                </p>
                                <div className="mt-2">
                                    <RiskBadge
                                        riskLevel={riskAssessment.riskLevel}
                                    />
                                </div>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-sm font-medium text-slate-500">
                                    Risk score
                                </p>
                                <p className="mt-1 text-3xl font-bold text-slate-900">
                                    {riskAssessment.riskScore ?? "—"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 py-6">
                            <div>
                                <h2 className="font-bold text-slate-900">Risk reasons</h2>
                                {riskAssessment.riskReasons?.length ? (
                                    <ul className="mt-3 space-y-2">
                                        {riskAssessment.riskReasons.map((reason) => (
                                            <li
                                                key={reason}
                                                className="flex gap-3 text-slate-700"
                                            >
                                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-slate-600">
                                        No risk reasons were recorded.
                                    </p>
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Recommended action
                                </h2>
                                <p className="mt-2 text-lg text-slate-700">
                                    {actionLabels[
                                        riskAssessment.recommendedAction
                                    ] || "Not available"}
                                </p>
                            </div>
                            <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                This result supports screening workflow decisions and is
                                not a medical diagnosis.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                needsReferral
                                    ? navigate(`/cases/${caseId}/referral`)
                                    : navigate(`/patients/${patientId}`)
                            }
                            className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-lg font-bold text-white transition hover:bg-emerald-800 sm:w-auto"
                        >
                            {needsReferral ? "Create Referral" : "Return to Patient"}
                        </button>
                    </section>
                )}
            </div>
        </main>
    );
};

export default RiskResultPage;
