const riskStyles = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    yellow: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
};

const riskLabels = {
    green: "Low Risk",
    yellow: "Moderate Risk",
    red: "High Risk",
};

const RiskBadge = ({ riskLevel }) => (
    <span
        className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
            riskStyles[riskLevel] || "border-slate-200 bg-slate-50 text-slate-700"
        }`}
    >
        {riskLabels[riskLevel] || "Not Assessed"}
    </span>
);

export default RiskBadge;
