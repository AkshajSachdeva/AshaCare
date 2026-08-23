import { CalendarDays, Lightbulb, MapPin, Phone, ShieldCheck, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { ErrorState, Loading, PageHeader, RiskBadge, useLoad } from '../components/UI';
import Schemes from '../components/Schemes';
import { localizeContent } from '../i18n/content';

const tipsByCategory = {
  pregnancy: ['pregnancyTip1', 'pregnancyTip2', 'pregnancyTip3'],
  blood_pressure: ['bloodPressureTip1', 'bloodPressureTip2', 'bloodPressureTip3'],
  diabetes: ['diabetesTip1', 'diabetesTip2', 'diabetesTip3'],
  tuberculosis: ['tuberculosisTip1', 'tuberculosisTip2', 'tuberculosisTip3'],
  general: ['generalTip1', 'generalTip2', 'generalTip3']
};

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useI18n();
  const { setUser } = useAuth();
  const { data, error, loading, reload } = useLoad(() => api(`/patients/${id}`), [id]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (loading) return <><PageHeader title={t('patients')} back/><Loading/></>;
  if (error) return <><PageHeader title={t('patients')} back/><ErrorState message={error} onRetry={reload}/></>;
  const { patient:p, cases } = data;

  const hardDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api(`/patients/${id}`, { method:'DELETE' });
      const me = await api('/auth/me');
      setUser(me.currentUser);
      navigate('/patients', { replace:true });
    } catch (caught) { setDeleteError(caught.message); setDeleting(false); }
  };

  return <>
    <PageHeader title={p.fullName} back/>
    <div className="space-y-5 px-5">
      {location.state?.beneficiaryAdded && <div className="rounded-2xl bg-emerald-100 p-4 text-sm font-bold text-emerald-900">{t('beneficiarySavedGuidance')}</div>}
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-care-700 to-care-400 p-5 text-white">
          <div className="flex items-start justify-between"><div><h1 className="text-2xl font-black">{p.fullName}</h1><p className="mt-1 text-sm text-white/75">{p.age} · {t(p.gender)}</p></div><RiskBadge risk={p.currentRiskLevel} t={t}/></div>
        </div>
        <div className="grid gap-3 p-5 text-sm">
          <p className="flex gap-2"><Phone size={17} className="text-care-500"/>{p.phoneNumber || '—'}</p>
          <p className="flex gap-2"><MapPin size={17} className="text-care-500"/>{p.address}, {p.village}</p>
          <p className="flex gap-2"><CalendarDays size={17} className="text-care-500"/>{t('nextFollowUp')}: {p.nextFollowUpDate ? new Date(p.nextFollowUpDate).toLocaleDateString(language) : '—'}</p>
          <div className="flex flex-wrap gap-2">{p.healthCategories.map(category => <span className="chip" key={category}>{t(category)}</span>)}</div>
          {p.description && <div className="mt-1 rounded-2xl bg-white/70 p-3"><strong className="block text-xs">{t('description')}</strong><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{p.description}</p></div>}
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center gap-2"><Lightbulb className="text-amber-600" size={22}/><h2 className="section-title">{t('healthGuidance')}</h2></div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{t('healthGuidanceNote')}</p>
        <div className="mt-4 space-y-4">
          {[...new Set(p.healthCategories?.length ? p.healthCategories : ['general'])].map(category => {
            const tipKeys = tipsByCategory[category] || tipsByCategory.general;
            return <div className="rounded-2xl bg-amber-50/70 p-4" key={category}>
              <h3 className="font-extrabold text-care-ink">{t(category)}</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                {tipKeys.map(tip => <li key={tip}>{t(tip)}</li>)}
              </ul>
            </div>;
          })}
        </div>
      </section>

      <Link className="btn-primary w-full" to={`/patients/${id}/screening`}>{t('startHealthCheck')}</Link>
      <section><h2 className="section-title mb-3">{t('recentActivity')}</h2>{cases.length ? <div className="space-y-2">{cases.map(careCase => <div className="card p-4" key={careCase._id}><div className="flex justify-between"><strong>{new Date(careCase.createdAt).toLocaleDateString(language)}</strong><RiskBadge risk={careCase.riskLevel} t={t}/></div><p className="mt-2 text-xs text-slate-500">{localizeContent(careCase.advice?.[0],t)}</p><Link className="mt-3 inline-block text-xs font-bold text-care-600" to={`/cases/${careCase._id}/follow-up`}>{t('proofUpload')} →</Link></div>)}</div> : <p className="card p-5 text-sm text-slate-400">{t('noCareActivity')}</p>}</section>
      <Schemes patientId={id}/>

      <section className="card p-5">
        <div className="flex items-center gap-2"><ShieldCheck className="text-emerald-600" size={21}/><h2 className="section-title">{t('privacyAndConsent')}</h2></div>
        <p className="mt-3 text-sm font-semibold text-emerald-800">{t('consentRecorded')}</p>
        {p.piiConsentAt && <p className="mt-1 text-xs text-slate-500">{new Date(p.piiConsentAt).toLocaleString(language)}</p>}
        <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-red-700" onClick={() => setConfirmingDelete(true)}><Trash2 size={17}/>{t('hardDelete')}</button>
      </section>
    </div>

    {confirmingDelete && <div className="fixed inset-0 z-50 grid place-items-center bg-care-ink/40 p-5 backdrop-blur-sm">
      <section className="card w-full max-w-[410px] p-5" role="dialog" aria-modal="true" aria-labelledby="delete-beneficiary-title">
        <div className="flex items-start justify-between gap-4"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-100 text-red-700"><Trash2/></div><button className="grid h-9 w-9 place-items-center rounded-full bg-white" onClick={() => setConfirmingDelete(false)} aria-label={t('close')}><X size={18}/></button></div>
        <h2 id="delete-beneficiary-title" className="mt-4 text-xl font-black">{t('deleteBeneficiary')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t('hardDeleteWarning')}</p>
        {deleteError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>}
        <div className="mt-5 grid gap-2"><button disabled={deleting} className="btn-primary btn-danger" onClick={hardDelete}>{deleting ? t('loading') : t('confirmDelete')}</button><button disabled={deleting} className="btn-secondary" onClick={() => setConfirmingDelete(false)}>{t('cancel')}</button></div>
      </section>
    </div>}
  </>;
}
