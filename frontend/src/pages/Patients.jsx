import { Check, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useI18n } from '../i18n/I18nContext';
import { ErrorState, Loading, PageHeader, RiskBadge, Toast, useLoad } from '../components/UI';

const emptyForm = {
  fullName: '',
  age: '',
  gender: 'female',
  phoneNumber: '',
  address: '',
  village: '',
  healthCategories: ['general'],
  currentRiskLevel: 'green',
  nextFollowUpDate: '',
  description: '',
  piiConsent: false
};

const riskOptions = ['green', 'yellow', 'red'];
const followUpDays = { red: 7, yellow: 21, green: 42 };
const dateValue = offsetDays => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Patients() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState('');
  const [open, setOpen] = useState(params.get('add') === '1');
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const { data, error, loading } = useLoad(() => api('/patients'), []);
  const maximumFollowUpDate = dateValue(followUpDays[form.currentRiskLevel]);

  const list = useMemo(() => data?.patients.filter(patient =>
    (!risk || patient.currentRiskLevel === risk) &&
    [patient.fullName, patient.village, patient.phoneNumber].some(value =>
      value?.toLowerCase().includes(search.toLowerCase())
    )
  ) || [], [data, search, risk]);

  const save = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      const created = await api('/patients', {
        method: 'POST',
        body: { ...form, age: Number(form.age) }
      });
      setForm(emptyForm);
      setOpen(false);
      navigate(`/patients/${created.patient._id}`, {
        state: { beneficiaryAdded: true }
      });
    } catch (caught) {
      setToast(caught.message);
    } finally {
      setBusy(false);
    }
  };

  return <>
    <PageHeader
      title={t('patients')}
      action={<button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl bg-care-600 text-white" aria-label={t('addPatient')}><Plus/></button>}
    />
    <div className="px-5">
      <div className="relative">
        <Search className="absolute left-4 top-4 text-slate-400" size={18}/>
        <input className="input pl-11" placeholder={t('searchPatients')} value={search} onChange={event => setSearch(event.target.value)}/>
      </div>
      <div className="my-4 flex gap-2 overflow-x-auto px-2 pb-2 pt-2">
        {riskOptions.map(option => <button
          className={`chip inline-flex items-center gap-1.5 whitespace-nowrap risk-filter-${option} ${risk === option ? '!border-care-600 !bg-care-600 !text-white' : ''}`}
          onClick={() => setRisk(current => current === option ? '' : option)}
          key={option}
        >
          {t(option)}
          {risk === option && <X size={13} aria-label={t('removeFilter')}/>}
        </button>)}
      </div>

      {loading ? <Loading/> : error ? <ErrorState message={error}/> : list.length === 0
        ? <div className="card p-8 text-center text-sm text-slate-500">{t('noPatients')}</div>
        : <div className="space-y-3">{list.map(patient => <Link to={`/patients/${patient._id}`} className="card block p-4 active:scale-[.99]" key={patient._id}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-extrabold">{patient.fullName}</h2>
              <p className="mt-1 text-xs text-slate-500">{patient.age} {t('age').toLowerCase()} · {t(patient.gender)} · {patient.village}</p>
            </div>
            <RiskBadge risk={patient.currentRiskLevel} t={t}/>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
            <span className="rounded-lg bg-care-50 px-2 py-1 text-[11px] font-bold text-care-700">{t(patient.healthCategories[0])}</span>
            <span className="text-[11px] text-slate-400">{t('nextFollowUp')}: {patient.nextFollowUpDate ? new Date(patient.nextFollowUpDate).toLocaleDateString(language) : '—'}</span>
          </div>
        </Link>)}</div>}
    </div>

    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-care-ink/30 backdrop-blur-sm">
      <form className="max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-t-[2rem] bg-[#f4faf7] p-5" onSubmit={save}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">{t('addPatient')}</h2>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white" onClick={() => setOpen(false)} aria-label={t('close')}><X/></button>
        </div>
        <div className="grid gap-3">
          <label>
            <span className="label">{t('fullName')}</span>
            <input className="input" required value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })}/>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">{t('age')}</span>
              <input className="input" required type="number" min="0" max="120" value={form.age} onChange={event => setForm({ ...form, age: event.target.value })}/>
            </label>
            <label>
              <span className="label">{t('gender')}</span>
              <select className="input" value={form.gender} onChange={event => setForm({ ...form, gender: event.target.value })}>
                {['female', 'male', 'other'].map(option => <option value={option} key={option}>{t(option)}</option>)}
              </select>
            </label>
          </div>
          <label>
            <span className="label">{t('phone')}</span>
            <input className="input" inputMode="tel" value={form.phoneNumber} onChange={event => setForm({ ...form, phoneNumber: event.target.value })}/>
          </label>
          <label>
            <span className="label">{t('village')}</span>
            <input className="input" required value={form.village} onChange={event => setForm({ ...form, village: event.target.value })}/>
          </label>
          <label>
            <span className="label">{t('address')}</span>
            <textarea className="input" value={form.address} onChange={event => setForm({ ...form, address: event.target.value })}/>
          </label>
          <label>
            <span className="label">{t('healthCategories')}</span>
            <select className="input" value={form.healthCategories[0]} onChange={event => setForm({ ...form, healthCategories: [event.target.value] })}>
              {['pregnancy', 'blood_pressure', 'diabetes', 'tuberculosis', 'general'].map(option => <option value={option} key={option}>{t(option)}</option>)}
            </select>
          </label>

          <fieldset>
            <legend className="label">{t('riskLevel')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {riskOptions.map(option => {
                const selected = form.currentRiskLevel === option;
                return <button
                  type="button"
                  key={option}
                  aria-pressed={selected}
                  onClick={() => setForm(current => ({
                    ...current,
                    currentRiskLevel: option,
                    nextFollowUpDate: current.nextFollowUpDate && current.nextFollowUpDate > dateValue(followUpDays[option]) ? '' : current.nextFollowUpDate
                  }))}
                  className={`chip relative flex min-h-12 items-center justify-center gap-1 risk-filter-${option} ${selected ? 'ring-2 ring-care-700 ring-offset-2' : ''}`}
                >
                  {selected && <Check size={15}/>}
                  {t(`${option}RiskLabel`)}
                </button>;
              })}
            </div>
          </fieldset>

          <label>
            <span className="label">{t('nextFollowUpDate')}</span>
            <input
              className="input"
              type="date"
              required
              min={dateValue(0)}
              max={maximumFollowUpDate}
              value={form.nextFollowUpDate}
              onChange={event => setForm({ ...form, nextFollowUpDate: event.target.value })}
            />
            <small className="mt-1 block text-[11px] leading-relaxed text-slate-500">
              {t(`${form.currentRiskLevel}FollowUpLimit`)} · {t('latestAllowed')}: {new Date(`${maximumFollowUpDate}T00:00:00`).toLocaleDateString(language)}
            </small>
          </label>

          <label>
            <span className="label">{t('description')} <span className="font-normal text-slate-400">({t('optional')})</span></span>
            <textarea
              className="input min-h-24"
              maxLength="1000"
              placeholder={t('descriptionPlaceholder')}
              value={form.description}
              onChange={event => setForm({ ...form, description: event.target.value })}
            />
          </label>

          <label className="card flex items-start gap-3 p-4">
            <input className="mt-1 h-4 w-4 accent-care-600" type="checkbox" required checked={form.piiConsent} onChange={event => setForm({ ...form, piiConsent: event.target.checked })}/>
            <span>
              <strong className="block text-sm">{t('piiConsent')}</strong>
              <small className="mt-1 block text-[11px] leading-relaxed text-slate-500">{t('piiConsentHelp')}</small>
            </span>
          </label>
          <button disabled={busy} className="btn-primary mt-2">{busy ? t('loading') : t('savePatient')}</button>
        </div>
      </form>
    </div>}
    <Toast message={toast} onDone={() => setToast('')}/>
  </>;
}
