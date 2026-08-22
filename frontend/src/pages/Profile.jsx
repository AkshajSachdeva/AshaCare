import { Camera, Globe2, LogOut, MapPin, Star, Type } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, PageHeader, Toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { languages } from '../i18n/translations';
import { api } from '../lib/api';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const photoInput = useRef();
  const [textSize, setTextSize] = useState(localStorage.getItem('textSize') || 'medium');
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
    if (!file.type.startsWith('image/') || file.size > 500 * 1024) { setToast('Choose an image smaller than 500 KB.'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try { const data = await api('/auth/me', { method: 'PATCH', body: { profilePhoto: reader.result } }); setUser(data.currentUser); setToast('Profile photo updated.'); }
      catch (error) { setToast(error.message); }
    };
    reader.readAsDataURL(file);
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

      <section className="card p-5"><div className="mb-3 flex items-center gap-2"><Type className="text-care-500"/><h2 className="section-title">{t('textSize')}</h2></div><div className="grid grid-cols-3 gap-2">{['small', 'medium', 'large'].map(size => <button className={`chip capitalize ${textSize === size ? '!bg-care-600 !text-white' : ''}`} key={size} onClick={() => changeTextSize(size)}>{t(size)}</button>)}</div></section>
      <section className="card p-5"><div className="mb-3 flex items-center gap-2"><Globe2 className="text-care-500"/><h2 className="section-title">{t('language')}</h2></div><div className="grid grid-cols-2 gap-2">{languages.map(([code, label]) => <button className={`chip ${language === code ? '!bg-care-600 !text-white' : ''}`} key={code} onClick={() => changeLanguage(code)}>{label}</button>)}</div></section>
      <button className="btn-secondary w-full !border-red-100 !text-red-600" onClick={out}><LogOut size={18}/>{t('logout')}</button>
      <div className="flex justify-center py-4"><Logo size={72}/></div>
    </div>
    <Toast message={toast} onDone={() => setToast('')}/>
  </>;
}
