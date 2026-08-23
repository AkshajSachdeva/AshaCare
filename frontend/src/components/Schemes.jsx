import { ExternalLink, FileText, Gift, Landmark, MapPin } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { useI18n } from '../i18n/I18nContext';
import { ErrorState, Loading, Toast, useLoad } from './UI';
import { localizeContent } from '../i18n/content';

export default function Schemes({ patientId }) {
  const { t } = useI18n();
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState('');
  const { data, error, loading, reload } = useLoad(() => api(`/schemes/recommended/${patientId}`), [patientId]);

  const act = async scheme => {
    setBusy(scheme._id);
    try {
      if (!scheme.enrollment) {
        await api(`/schemes/${scheme._id}/enroll`, { method:'POST', body:{ patientId } });
        setToast(t('registrationStartedToast'));
      } else {
        const result = await api(`/schemes/enrollments/${scheme.enrollment._id}`, { method:'PATCH', body:{ status:'registered' } });
        setToast(result.awarded ? t('registrationVerifiedPoints') : t('alreadyRegistered'));
      }
      reload();
    } catch (caught) {
      setToast(caught.message);
    } finally {
      setBusy('');
    }
  };

  if (loading) return <section><h2 className="section-title mb-3">{t('recommendedSchemes')}</h2><Loading/></section>;
  if (error) return <section><h2 className="section-title mb-3">{t('recommendedSchemes')}</h2><ErrorState message={error} onRetry={reload}/></section>;

  const groups = ['central', 'state']
    .map(level => ({ level, schemes:data.schemes.filter(scheme => scheme.governmentLevel === level) }))
    .filter(group => group.schemes.length);

  return <section>
    <h2 className="section-title mb-1">{t('recommendedSchemes')}</h2>
    <p className="mb-3 text-xs text-slate-400">{t('schemeDisclaimer')}</p>
    <div className="mb-4 flex items-start gap-2 rounded-2xl bg-care-50 p-3 text-xs text-care-700">
      <MapPin className="mt-0.5 shrink-0" size={16}/>
      <span>{data.location?.state
        ? t('schemesUsingLocation', { location:data.location.label, state:data.location.state })
        : t('centralSchemesOnly', { location:data.location?.label || t('locationUnknown') })}</span>
    </div>

    {!data.schemes.length
      ? <p className="card p-5 text-sm text-slate-400">{t('noSchemes')}</p>
      : <div className="space-y-6">{groups.map(group => <div key={group.level}>
        <div className="mb-3 flex items-center gap-2">
          <Landmark className="text-care-500" size={19}/>
          <h3 className="font-black">{t(`${group.level}Schemes`)}</h3>
          <span className="chip ml-auto">{group.schemes.length}</span>
        </div>
        <div className="space-y-3">{group.schemes.map(scheme => <SchemeCard key={scheme._id} scheme={scheme} busy={busy} patientId={patientId} act={act} t={t}/>)}</div>
      </div>)}</div>}
    <Toast message={toast} onDone={() => setToast('')}/>
  </section>;
}

function SchemeCard({ scheme, busy, act, t }) {
  const categories = (scheme.matchedCategories || []).map(category => t(category)).join(', ');
  const matchText = scheme.governmentLevel === 'state'
    ? t('stateSchemeMatch', { categories })
    : t('centralSchemeMatch', { categories });

  return <article className="card p-5">
    <div className="flex items-start justify-between gap-3">
      <h4 className="font-extrabold leading-tight">{scheme.schemeName}</h4>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${scheme.governmentLevel === 'state' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{t(scheme.governmentLevel)}</span>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-slate-500">{localizeContent(scheme.description, t)}</p>

    {scheme.benefits?.length > 0 && <div className="mt-3 flex items-start gap-2 rounded-2xl bg-emerald-50/70 p-3 text-xs text-emerald-900">
      <Gift className="mt-0.5 shrink-0" size={16}/>
      <span>{scheme.benefits.map(benefit => localizeContent(benefit, t)).join(' · ')}</span>
    </div>}

    <div className="mt-3 rounded-2xl bg-care-50 p-3">
      <strong className="text-xs text-care-700">{t('whyEligible')}</strong>
      <p className="mt-1 text-xs text-slate-600">{matchText} {t('confirmEligibility')}</p>
    </div>
    <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
      <FileText className="shrink-0" size={16}/>
      <span><strong>{t('documentsNeeded')}:</strong> {scheme.requiredDocuments.map(document => localizeContent(document, t)).join(', ')}</span>
    </div>
    <p className="mt-2 text-[10px] text-slate-400">{t('verifiedSource')}: {scheme.sourceName}</p>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <a href={scheme.registrationUrl || scheme.sourceUrl} target="_blank" rel="noreferrer" className="btn-secondary !min-h-10 !px-3 !py-2 text-xs">{t('officialSource')}<ExternalLink size={14}/></a>
      <button disabled={busy === scheme._id} onClick={() => act(scheme)} className="btn-primary !min-h-10 !px-3 !py-2 text-xs">{scheme.enrollment ? t('markRegistered') : t('registerPatient')}</button>
    </div>
    {scheme.enrollment && <p className="mt-2 text-center text-[11px] font-bold text-care-600">{t(scheme.enrollment.status)}</p>}
  </article>;
}
