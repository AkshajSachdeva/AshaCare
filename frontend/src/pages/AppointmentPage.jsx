import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCareCaseById, scheduleAppointment } from "../services/caseApi";

const fieldClassName =
    "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const AppointmentPage = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [careCase, setCareCase] = useState(null);
    const [hospitalName, setHospitalName] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [appointmentNotes, setAppointmentNotes] = useState("");
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
                setHospitalName(
                    loadedCareCase.appointment?.hospitalName ||
                        loadedCareCase.referral?.facilityName ||
                        ""
                );
                setAppointmentDate(
                    loadedCareCase.appointment?.appointmentDate
                        ? loadedCareCase.appointment.appointmentDate.slice(0, 10)
                        : ""
                );
                setAppointmentTime(
                    loadedCareCase.appointment?.appointmentTime || ""
                );
                setAppointmentNotes(
                    loadedCareCase.appointment?.appointmentNotes || ""
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
            const response = await scheduleAppointment(caseId, {
                hospitalName,
                appointmentDate,
                appointmentTime,
                appointmentNotes,
            });
            setCareCase(
                response.data?.careCase || {
                    ...careCase,
                    appointment: {
                        appointmentStatus: "scheduled",
                        hospitalName,
                        appointmentDate,
                        appointmentTime,
                        appointmentNotes,
                    },
                }
            );
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                    "Unable to schedule the appointment. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="p-6 text-lg text-slate-600">Loading...</p>;
    }

    const isScheduled =
        careCase?.appointment?.appointmentStatus === "scheduled";
    const patientId = careCase?.patientId?._id || careCase?.patientId;

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
                <header>
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                        Care coordination
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        Schedule Appointment
                    </h1>
                </header>

                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {errorMessage}
                    </div>
                )}

                {isScheduled ? (
                    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7">
                        <div className="mb-6 rounded-full bg-emerald-100 px-4 py-2 text-center font-bold text-emerald-800 sm:w-fit">
                            Appointment Scheduled
                        </div>
                        <dl className="grid gap-5 rounded-xl bg-slate-50 p-5 sm:grid-cols-3">
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Hospital</dt>
                                <dd className="mt-1 font-semibold text-slate-900">
                                    {careCase.appointment.hospitalName}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Date</dt>
                                <dd className="mt-1 font-semibold text-slate-900">
                                    {careCase.appointment.appointmentDate
                                        ? new Intl.DateTimeFormat("en-IN", {
                                              dateStyle: "medium",
                                          }).format(
                                              new Date(
                                                  careCase.appointment.appointmentDate
                                              )
                                          )
                                        : "Not available"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Time</dt>
                                <dd className="mt-1 font-semibold text-slate-900">
                                    {careCase.appointment.appointmentTime ||
                                        "Not available"}
                                </dd>
                            </div>
                        </dl>
                        <button
                            type="button"
                            onClick={() => navigate(`/patients/${patientId}`)}
                            className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-lg font-bold text-white transition hover:bg-emerald-800 sm:w-auto"
                        >
                            Back to Patient
                        </button>
                    </section>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                    >
                        <label className="block font-semibold text-slate-800">
                            Hospital
                            <input
                                type="text"
                                value={hospitalName}
                                onChange={(event) =>
                                    setHospitalName(event.target.value)
                                }
                                required
                                className={fieldClassName}
                            />
                        </label>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block font-semibold text-slate-800">
                                Date
                                <input
                                    type="date"
                                    value={appointmentDate}
                                    onChange={(event) =>
                                        setAppointmentDate(event.target.value)
                                    }
                                    required
                                    className={fieldClassName}
                                />
                            </label>
                            <label className="block font-semibold text-slate-800">
                                Time
                                <input
                                    type="time"
                                    value={appointmentTime}
                                    onChange={(event) =>
                                        setAppointmentTime(event.target.value)
                                    }
                                    required
                                    className={fieldClassName}
                                />
                            </label>
                        </div>
                        <label className="block font-semibold text-slate-800">
                            Appointment notes
                            <textarea
                                rows="4"
                                value={appointmentNotes}
                                onChange={(event) =>
                                    setAppointmentNotes(event.target.value)
                                }
                                className={fieldClassName}
                                placeholder="Instructions for the patient"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-lg font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
};

export default AppointmentPage;
