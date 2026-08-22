import { ArrowRight, Award, Crown, Gift, Medal, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useI18n } from '../i18n/I18nContext';
import { ErrorState, Loading, PageHeader, useLoad } from '../components/UI';

const initials = name => name.split(' ').map(part => part[0]).slice(0, 2).join('');

export default function Rewards() {
  const { t } = useI18n();
  const { data, error, loading, reload } = useLoad(() => api('/rewards'), []);
  if (loading) return <><PageHeader title={t('rewards')}/><Loading/></>;
  if (error) return <><PageHeader title={t('rewards')}/><ErrorState message={error} onRetry={reload}/></>;

  const topThree = data.leaderboard.slice(0, 3);
  const recent = data.transactions.slice(0, 4);

  return <>
    <PageHeader title={t('rewards')}/>
    <div className="space-y-6 px-5">
      <section className="rewards-hero">
        <div className="flex items-start justify-between">
          <div className="rewards-gift"><Gift size={24}/></div>
          <span className="reward-sparkle"><Sparkles size={15}/> Verified work</span>
        </div>
        <p className="mt-5 text-sm font-semibold text-white/80">{t('totalPoints')}</p>
        <div className="mt-1 flex items-end gap-2"><strong className="text-6xl font-black leading-none">{data.totalPoints}</strong><span className="pb-1 text-sm font-bold text-white/75">points</span></div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="reward-glass"><Trophy size={18}/><span>{t('yourRank')}</span><strong>#{data.rank || '—'}</strong></div>
          <div className="reward-glass"><Award size={18}/><span>Verified actions</span><strong>{data.transactions.length}</strong></div>
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-white/65">{t('demoModel')}</p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><div><h2 className="section-title">{t('topPerformers')}</h2><p className="text-xs text-slate-400">Celebrating verified community care</p></div><Crown className="text-amber-500" size={25}/></div>
        <div className="performers-card">
          {topThree.map(worker => <div className={`performer-row rank-${worker.rank}`} key={worker._id}>
            <div className="rank-medal">{worker.rank === 1 ? <Crown size={17}/> : worker.rank}</div>
            {worker.profilePhoto ? <img className="performer-avatar" src={worker.profilePhoto} alt=""/> : <div className="performer-avatar performer-initials">{initials(worker.fullName)}</div>}
            <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{worker.fullName}</strong><p className="truncate text-[11px] text-slate-400">{worker.assignedRegion}</p></div>
            <div className="text-right"><strong className="block text-lg text-care-600">{worker.totalPoints}</strong><span className="text-[10px] font-bold text-slate-400">POINTS</span></div>
          </div>)}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">{t('recentPoints')}</h2>
        {recent.length ? <div className="space-y-2">{recent.map(transaction => <RewardRow transaction={transaction} key={transaction._id}/>)}</div> : <p className="card p-5 text-sm text-slate-400">No verified points yet</p>}
        {data.transactions.length > 0 && <Link to="/rewards/history" className="btn-secondary mt-3 w-full">{t('viewAllPoints')}<ArrowRight size={17}/></Link>}
      </section>
    </div>
  </>;
}

export function RewardRow({ transaction }) {
  return <div className="reward-row">
    <div className="reward-row-icon"><Medal size={19}/></div>
    <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{transaction.description}</strong><p className="text-[11px] text-slate-400">{new Date(transaction.createdAt).toLocaleDateString()}</p></div>
    <b className="reward-points">+{transaction.points}</b>
  </div>;
}
