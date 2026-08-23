import { Bell, CalendarDays, HeartPulse, MapPin, Star, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { api } from '../lib/api';
import { ErrorState, Loading, useLoad } from '../components/UI';

export default function Home() {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const { data, error, loading, reload } = useLoad(() => api('/dashboard'), []);
  const [selected, setSelected] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const refreshUnread = () => api('/notifications').then(result => setUnreadCount(result.unreadCount)).catch(() => {});
    const updateUnread = event => setUnreadCount(event.detail.unreadCount);
    refreshUnread();
    window.addEventListener('focus', refreshUnread);
    window.addEventListener('notifications-updated', updateUnread);
    return () => {
      window.removeEventListener('focus', refreshUnread);
      window.removeEventListener('notifications-updated', updateUnread);
    };
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const now = new Date();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const stats = [
    [t('visitsToday'), data.stats.visitsToday, CalendarDays, 'bg-blue-50 text-blue-600'],
    [t('highRisk'), data.stats.highRisk, HeartPulse, 'bg-red-50 text-red-600'],
    [t('followUpsDue'), data.stats.followUpsDue, Users, 'bg-amber-50 text-amber-600'],
    [t('totalPoints'), data.stats.totalPoints, Star, 'bg-care-50 text-care-600'],
  ];

  return <>
    <header className="home-header px-5 pb-20 pt-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 pt-1">
          <h1 className="text-2xl font-black leading-tight text-care-700">{user.fullName}</h1>
          <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-care-400"><MapPin size={13}/>{user.assignedRegion}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link to="/patients?add=1" className="home-quick" aria-label={t('addPatient')}>
            <UserPlus size={21}/>
          </Link>
          <Link to="/notifications" className="home-quick home-notification" aria-label={t('notifications')}>
            <Bell size={22}/>
            {unreadCount > 0 && <i className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black not-italic text-white">{unreadCount}</i>}
          </Link>
        </div>
      </div>
    </header>

    <div className="-mt-14 px-5">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, value, Icon, style]) => <div className="stat-card card p-4" key={label}>
          <div className={`clay-icon grid h-9 w-9 place-items-center rounded-xl ${style}`}><Icon size={18}/></div>
          <strong className="mt-3 block text-2xl">{value}</strong>
          <span className="text-xs font-semibold text-slate-500">{label}</span>
        </div>)}
      </div>

      <section className="card mt-5 p-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">{t('careCalendar')}</h2>
            <p className="text-xs text-slate-400">{now.toLocaleDateString(language, { month: 'long', year: 'numeric' })} · {t('workload')}</p>
          </div>
          <div className="flex gap-1">{[0, 1, 2, 3, 4].map(x => <i key={x} className={`h-3 w-3 rounded-sm ${['bg-care-50', 'bg-care-100', 'bg-care-200', 'bg-care-400', 'bg-care-700'][x]}`}/>)}</div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400">
          {Array.from({length:7},(_,i)=>new Intl.DateTimeFormat(language,{weekday:'narrow'}).format(new Date(2023,0,i+1))).map((d,i)=><span key={i}>{d}</span>)}
          {Array.from({ length: first }).map((_, i) => <span key={`e${i}`}/>)}
          {Array.from({ length: days }).map((_, i) => {
            const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
            const key = date.toISOString().slice(0, 10);
            const entry = data.calendar[key];
            const level = Math.min(entry?.visits || 0, 4);
            const today = i + 1 === now.getDate();
            return <button key={key} onClick={() => setSelected({ day: i + 1, ...(entry || { visits: 0, followUps: 0, patients: [] }) })} className={`calendar-day aspect-square rounded-xl text-xs font-black transition ${['bg-care-50 text-slate-400', 'bg-care-100 text-care-700', 'bg-care-200 text-care-700', 'bg-care-400 text-white', 'bg-care-700 text-white'][level]} ${today ? 'ring-2 ring-care-yellow ring-offset-2' : ''}`}>{i + 1}</button>;
          })}
        </div>
        {selected && <div className="mt-4 rounded-2xl bg-care-50 p-4">
          <div className="flex justify-between"><strong>{now.toLocaleDateString(language, { month: 'short' })} {selected.day}</strong><button className="text-xs font-bold text-care-600" onClick={() => setSelected(null)}>{t('close')}</button></div>
          <p className="mt-1 text-sm">{selected.visits} {t('plannedVisits')} · {selected.followUps} {t('followUps')}</p>
          {selected.patients.length > 0 && <div className="mt-3 space-y-2">
            {selected.patients.map((patient, index) => {
              const item = typeof patient === 'string' ? { name: patient, riskLevel: 'green' } : patient;
              const riskColor = { red: 'bg-red-500', yellow: 'bg-amber-400', green: 'bg-emerald-500' }[item.riskLevel] || 'bg-emerald-500';
              return <div className="calendar-patient" key={item.id || `${item.name}-${index}`}>
                <i className={`calendar-risk-dot ${riskColor}`} aria-label={`${t(item.riskLevel)} ${t('riskScore')}`}/>
                <span>{item.name}</span>
              </div>;
            })}
          </div>}
        </div>}
      </section>
    </div>
  </>;
}
