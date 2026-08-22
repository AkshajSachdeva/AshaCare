import { api } from '../lib/api';
import { useI18n } from '../i18n/I18nContext';
import { ErrorState, Loading, PageHeader, useLoad } from '../components/UI';
import { RewardRow } from './Rewards';

export default function RewardsHistory() {
  const { t } = useI18n();
  const { data, error, loading, reload } = useLoad(() => api('/rewards?all=true'), []);
  if (loading) return <><PageHeader title={t('pointsHistory')} back/><Loading/></>;
  if (error) return <><PageHeader title={t('pointsHistory')} back/><ErrorState message={error} onRetry={reload}/></>;
  return <><PageHeader title={t('pointsHistory')} back/><div className="px-5"><div className="mb-4 rounded-2xl bg-care-100 p-4"><p className="text-xs font-bold text-care-500">{t('totalPoints')}</p><strong className="text-3xl font-black text-care-700">{data.totalPoints}</strong></div>{data.transactions.length ? <div className="space-y-2">{data.transactions.map(transaction => <RewardRow transaction={transaction} key={transaction._id}/>)}</div> : <p className="card p-5 text-sm text-slate-400">No verified points yet</p>}</div></>;
}
