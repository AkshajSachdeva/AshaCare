import { Crosshair, LoaderCircle, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { api } from '../lib/api';
import { getCurrentLocationName } from '../lib/location';

const locationErrorKey = error => {
  if (error?.message === 'locationLookupFailed') return 'locationLookupFailed';
  if (error?.message === 'locationUnsupported') return 'locationUnsupported';
  if (error?.code === 1) return 'locationPermissionDenied';
  if (error?.code === 3) return 'locationTimedOut';
  return 'locationUnavailable';
};

export default function LocationSetup() {
  const { user, setUser } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const started = useRef(false);
  const [location, setLocation] = useState(user.assignedRegion || '');
  const [status, setStatus] = useState('locating');
  const [message, setMessage] = useState('');

  const destination = user.role === 'supervisor' ? '/supervisor' : '/home';

  const saveLocation = async name => {
    const data = await api('/auth/me', { method:'PATCH', body:{ assignedRegion:name.trim() } });
    setUser(data.currentUser);
    setLocation(data.currentUser.assignedRegion);
  };

  const detect = async () => {
    setStatus('locating');
    setMessage('');
    try {
      const name = await getCurrentLocationName();
      await saveLocation(name);
      setStatus('ready');
      setMessage('locationDetected');
    } catch (error) {
      setStatus('manual');
      setMessage(locationErrorKey(error));
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    detect();
  }, []);

  const saveManual = async event => {
    event.preventDefault();
    if (!location.trim()) return;
    setStatus('saving');
    setMessage('');
    try {
      await saveLocation(location);
      setStatus('ready');
      setMessage('locationSaved');
    } catch (error) {
      setStatus('manual');
      setMessage(error.message);
    }
  };

  return <main className="app-shell min-h-screen px-6 py-8">
    <Logo/>
    <section className="card mt-12 p-6">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-care-50 text-care-600"><MapPin size={28}/></div>
      <h1 className="mt-5 text-2xl font-black">{t('setWorkLocation')}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{t('locationPermissionHelp')}</p>

      {status === 'locating' && <div className="mt-6 flex items-center gap-3 rounded-2xl bg-care-50 p-4 text-sm font-bold text-care-700"><LoaderCircle className="animate-spin" size={20}/>{t('detectingLocation')}</div>}

      <form className="mt-6 space-y-3" onSubmit={saveManual}>
        <label>
          <span className="label">{t('workLocation')}</span>
          <input className="input" required maxLength="120" value={location} onChange={event => setLocation(event.target.value)} placeholder={t('locationPlaceholder')}/>
        </label>
        {message && <p className={`rounded-xl p-3 text-xs ${status === 'ready' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{t(message)}</p>}
        <button disabled={status === 'locating' || status === 'saving'} className="btn-primary w-full">{status === 'saving' ? t('loading') : t('saveLocation')}</button>
      </form>

      <button className="btn-secondary mt-3 w-full" disabled={status === 'locating'} onClick={detect}><Crosshair size={18}/>{t('useCurrentLocation')}</button>
      <button className="mt-5 w-full text-sm font-bold text-care-600" onClick={() => navigate(destination, { replace:true })}>{t('continueToApp')}</button>
    </section>
  </main>;
}
