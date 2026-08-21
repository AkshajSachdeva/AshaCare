import { useEffect, useState } from "react";
import { useLanguage } from "../i18n";

const ConnectionStatus = () => {
    const { t } = useLanguage();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    useEffect(() => { const online = () => { setIsOnline(true); setIsSyncing(true); window.setTimeout(() => setIsSyncing(false), 1200); }; const offline = () => { setIsOnline(false); setIsSyncing(false); }; window.addEventListener("online", online); window.addEventListener("offline", offline); return () => { window.removeEventListener("online", online); window.removeEventListener("offline", offline); }; }, []);
    return !isOnline ? <div role="status" className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900">{t.offline} — {t.offlineMessage}</div> : <div role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{isSyncing ? t.syncing : t.online}</div>;
};
export default ConnectionStatus;
