import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { Logo } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';

export default function Auth({ mode }) {
  const { t } = useI18n();
  const { requestOtp, verifyOtp, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName:'', ashaId:mode === 'login' ? 'ASHA-ANAND-001' : '', phoneNumber:'', email:'', password:'', preferredLanguage:'en' });
  const [otp, setOtp] = useState('');
  const [otpSession, setOtpSession] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const finish = () => navigate('/location-setup');
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') return finish(await signup(form));
      if (!otpSession) return setOtpSession(await requestOtp(form.ashaId));
      finish(await verifyOtp({ ashaId:form.ashaId, otp }));
    } catch (caught) { setError(caught.message); }
    finally { setBusy(false); }
  };

  return <main className="app-shell min-h-screen px-6 py-8">
    <Link to="/"><Logo/></Link>
    <div className="mt-12">
      <p className="text-sm font-bold text-care-500">{mode === 'login' ? t('welcomeBack') : t('getStarted')}</p>
      <h1 className="mt-1 text-3xl font-black">{mode === 'login' ? t('signIn') : t('createAccount')}</h1>
    </div>
    <form className="mt-8 space-y-4" onSubmit={submit}>
      {mode === 'signup' && <>
        <Field label={t('fullName')}><input className="input" required value={form.fullName} onChange={event => setForm({...form,fullName:event.target.value})}/></Field>
        <Field label={t('phone')}><input className="input" required inputMode="tel" value={form.phoneNumber} onChange={event => setForm({...form,phoneNumber:event.target.value})}/></Field>
        <Field label={t('email')}><input className="input" type="email" required value={form.email} onChange={event => setForm({...form,email:event.target.value})}/></Field>
        <Field label={t('password')}><input className="input" type="password" minLength="8" required value={form.password} onChange={event => setForm({...form,password:event.target.value})}/></Field>
      </>}

      {!otpSession ? <Field label={t('ashaId')}><input className="input uppercase" required autoCapitalize="characters" value={form.ashaId} onChange={event => setForm({...form,ashaId:event.target.value.toUpperCase()})}/></Field> : <>
        <div className="card flex items-center gap-3 p-4"><Smartphone className="text-care-500"/><div><p className="text-xs text-slate-500">{t('otpSentTo')}</p><strong className="tracking-widest">{otpSession.maskedPhone}</strong></div></div>
        <Field label={t('otp')}><input className="input text-center text-xl tracking-[.45em]" required inputMode="numeric" maxLength="6" value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g,''))}/></Field>
        <p className="rounded-2xl bg-care-50 p-3 text-center text-xs text-care-700">{t('demoOtp')}: <strong>{otpSession.demoOtp}</strong></p>
      </>}

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="btn-primary w-full">{busy ? t('loading') : mode === 'signup' ? t('createAccount') : otpSession ? t('verifyOtp') : t('requestOtp')}</button>
      {otpSession && <button type="button" className="btn-secondary w-full" onClick={() => { setOtpSession(null); setOtp(''); setError(''); }}><ArrowLeft size={17}/>{t('changeAshaId')}</button>}
    </form>
    <p className="mt-6 text-center text-sm text-slate-500">{mode === 'login' ? t('newToAshaCare') : t('alreadyHaveAccount')} <Link className="font-bold text-care-600" to={mode === 'login' ? '/signup' : '/login'}>{mode === 'login' ? t('createAccount') : t('signIn')}</Link></p>
    {mode === 'login' && !otpSession && <p className="mt-8 rounded-2xl bg-care-50 p-4 text-center text-xs text-care-700">{t('demoCredentials')}: ASHA-ANAND-001</p>}
  </main>;
}

function Field({ label, children }) { return <label><span className="label">{label}</span>{children}</label>; }
