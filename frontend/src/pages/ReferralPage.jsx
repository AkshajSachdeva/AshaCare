import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RiskBadge from "../components/RiskBadge";
import { createReferral, getCareCaseById } from "../services/caseApi";

const fieldClassName =
    "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const ReferralPage = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [careCase, setCareCase] = useState(null);
    const [facilityName, setFacilityName] = useState(
        "District Community Hospital"
    );
    const [referralReason, setReferralReason] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadCareCase = async () => {
            try {
                setIsLoading(true);
                const response = await getCareCaseById(caseId);
                const loadedCareCase = response.data.careCase;
                setCareCase(loadedCareCase);
                setFacilityName(
                    loadedCareCase.referral?.facilityName ||
                        "District Community Hospital"
                );
                setReferralReason(
                    loadedCareCase.referral?.referralReason || ""
                );
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            setErrorMessage("");
            await createReferral(caseId, { facilityName, referralReason });
            navigate(`/cases/${caseId}/appointment`);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                    "Unable to create the referral. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="p-6 text-lg text-slate-600">Loading...</p>;
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
                <header>
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                        Care coordination
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        Create Referral
                    </h1>
                </header>

                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {errorMessage}
                    </div>
                )}

                {careCase && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <section className="mb-6 rounded-xl bg-slate-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Screening risk
                                    </p>
                                    <div className="mt-2">
                                        <RiskBadge
                                            riskLevel={
                                                careCase.riskAssessment?.riskLevel
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-500">
                                        Risk score
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {careCase.riskAssessment?.riskScore ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <label className="block font-semibold text-slate-800">
                                Facility
                                <input
                                    type="text"
                                    value={facilityName}
                                    onChange={(event) =>
                                        setFacilityName(event.target.value)
                                    }
                                    required
                                    className={fieldClassName}
                                />
                            </label>
                            <label className="block font-semibold text-slate-800">
                                Referral reason
                                <textarea
                                    rows="4"
                                    value={referralReason}
                                    onChange={(event) =>
                                        setReferralReason(event.target.value)
                                    }
                                    required
                                    className={fieldClassName}
                                    placeholder="Reason for referral"
                                />
                            </label>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-lg font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {isSubmitting ? "Creating..." : "Create Referral"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ReferralPage;
