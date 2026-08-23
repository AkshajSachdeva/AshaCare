import { Camera, Check, Crosshair, Globe2, LogOut, MapPin, Star, Type } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, PageHeader, Toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { languages } from '../i18n/translations';
import { api } from '../lib/api';
import { getCurrentLocationName } from '../lib/location';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const photoInput = useRef();
  const [textSize, setTextSize] = useState(localStorage.getItem('textSize') || 'medium');
  const [location, setLocation] = useState(user.assignedRegion || '');
  const [locationBusy, setLocationBusy] = useState(false);
  const [toast, setToast] = useState('');

  const changeLanguage = async nextLanguage => {
    setLanguage(nextLanguage);
    try { const data = await api('/auth/me', { method: 'PATCH', body: { preferredLanguage: nextLanguage } }); setUser(data.currentUser); } catch {}
  };
  const changeTextSize = size => {
    setTextSize(size);
    localStorage.setItem('textSize', size);
    document.documentElement.dataset.textSize = size;
  };
  const changePhoto = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 500 * 1024) { setToast(t('photoTooLarge')); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try { const data = await api('/auth/me', { method: 'PATCH', body: { profilePhoto: reader.result } }); setUser(data.currentUser); setToast(t('photoUpdated')); }
      catch (error) { setToast(error.message); }
    };
    reader.readAsDataURL(file);
  };
  const saveLocation = async value => {
    const name = value.trim();
    if (!name) return;
    setLocationBusy(true);
    try {
      const data = await api('/auth/me', { method:'PATCH', body:{ assignedRegion:name } });
      setUser(data.currentUser);
      setLocation(data.currentUser.assignedRegion);
      setToast(t('locationSaved'));
    } catch (error) { setToast(error.message); }
    finally { setLocationBusy(false); }
  };
  const detectLocation = async () => {
    setLocationBusy(true);
    try {
      const name = await getCurrentLocationName();
      await saveLocation(name);
    } catch (error) {
      const key = error?.code === 1 ? 'locationPermissionDenied' : error?.code === 3 ? 'locationTimedOut' : error.message === 'locationLookupFailed' ? 'locationLookupFailed' : 'locationUnavailable';
      setToast(t(key));
      setLocationBusy(false);
    }
  };
  const out = () => { logout(); navigate('/'); };
  const initials = user.fullName.split(' ').map(part => part[0]).slice(0, 2).join('');

  return <>
    <PageHeader title={t('profile')}/>
    <div className="space-y-5 px-5">
      <section className="card p-6 text-center">
        <button className="profile-photo" onClick={() => photoInput.current.click()} aria-label={t('profilePhoto')}>
          {user.profilePhoto ? <img src={user.profilePhoto} alt=""/> : <span>{initials}</span>}
          <i><Camera size={14}/></i>
        </button>
        <input ref={photoInput} hidden type="file" accept="image/*" onChange={changePhoto}/>
        <p className="mt-2 text-[11px] font-bold text-care-500">{t('changePhoto')}</p>
        <h1 className="mt-3 text-xl font-black">{user.fullName}</h1>
        <p className="text-sm text-slate-400">{user.phoneNumber}</p>
        <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-care-50 p-3"><Star className="mx-auto text-care-500" size={20}/><strong className="mt-1 block">{user.totalPoints}</strong><span className="text-[10px] text-slate-400">{t('totalPoints')}</span></div><div className="rounded-2xl bg-care-50 p-3"><MapPin className="mx-auto text-care-500" size={20}/><strong className="mt-1 block text-xs">{user.assignedRegion}</strong><span className="text-[10px] text-slate-400">{t('assignedRegion')}</span></div></div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center gap-2"><MapPin className="text-care-500"/><h2 className="section-title">{t('workLocation')}</h2></div>
        <label>
          <span className="label">{t('editLocation')}</span>
          <input className="input" maxLength="120" value={location} onChange={event => setLocation(event.target.value)} placeholder={t('locationPlaceholder')}/>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn-primary" disabled={locationBusy || !location.trim()} onClick={() => saveLocation(location)}>{locationBusy ? t('loading') : t('saveLocation')}</button>
          <button className="btn-secondary" disabled={locationBusy} onClick={detectLocation}><Crosshair size={17}/>{t('useGps')}</button>
        </div>
      </section>

      <section className="card p-5"><div className="mb-3 flex items-center gap-2"><Type className="text-care-500"/><h2 className="section-title">{t('textSize')}</h2></div><div className="grid grid-cols-3 gap-2">{['small', 'medium', 'large'].map(size => <button aria-pressed={textSize === size} className={`profile-choice chip capitalize ${textSize === size ? 'is-selected' : ''}`} key={size} onClick={() => changeTextSize(size)}>{textSize === size && <Check size={14}/>}<span>{t(size)}</span></button>)}</div></section>
      <section className="card p-5"><div className="mb-3 flex items-center gap-2"><Globe2 className="text-care-500"/><h2 className="section-title">{t('language')}</h2></div><div className="grid grid-cols-2 gap-2">{languages.map(([code, label]) => <button aria-pressed={language === code} className={`profile-choice chip ${language === code ? 'is-selected' : ''}`} key={code} onClick={() => changeLanguage(code)}>{language === code && <Check size={14}/>}<span>{label}</span></button>)}</div></section>
      <button className="btn-secondary w-full !border-red-100 !text-red-600" onClick={out}><LogOut size={18}/>{t('logout')}</button>
      <div className="flex justify-center py-4"><Logo size={72}/></div>
    </div>
    <Toast message={toast} onDone={() => setToast('')}/>
  </>;
}
