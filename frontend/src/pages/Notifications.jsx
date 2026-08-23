import { Bell, ExternalLink, Landmark } from 'lucide-react';
import { api } from '../lib/api';
import { useI18n } from '../i18n/I18nContext';
import { ErrorState, Loading, PageHeader, useLoad } from '../components/UI';
import { localizeContent, notificationTitle } from '../i18n/content';

function announceUnreadCount(unreadCount) {
  window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { unreadCount } }));
}

export default function Notifications() {
  const { t } = useI18n();
  const { data, error, loading, reload, setData } = useLoad(() => api('/notifications'), []);

  const read = async notification => {
    if (!notification.isRead) {
      const result = await api(`/notifications/${notification._id}/read`, { method: 'PATCH' });
      setData(current => ({
        ...current,
        unreadCount: result.unreadCount,
        notifications: current.notifications.map(item => item._id === notification._id ? { ...item, isRead: true } : item),
      }));
      announceUnreadCount(result.unreadCount);
    }
    if (notification.category === 'patient_task' && notification.relatedId) location.href = `/patients/${notification.relatedId}`;
    else if (notification.sourceUrl) window.open(notification.sourceUrl, '_blank', 'noopener');
  };

  const readAll = async () => {
    const result = await api('/notifications/read-all', { method: 'PATCH' });
    setData(current => ({
      ...current,
      unreadCount: result.unreadCount,
      notifications: current.notifications.map(notification => ({ ...notification, isRead: true })),
    }));
    announceUnreadCount(result.unreadCount);
  };

  return <>
    <PageHeader
      title={t('notifications')}
      back
      action={data?.unreadCount ? <button onClick={readAll} className="text-xs font-bold text-care-600">{t('markAllRead')}</button> : null}
    />
    <div className="space-y-3 px-5 pt-3">
      {loading ? <Loading/> : error ? <ErrorState message={error} onRetry={reload}/> : data.notifications.length === 0
        ? <div className="card p-8 text-center text-sm text-slate-400">{t('noNotifications')}</div>
        : data.notifications.map(notification => {
          const Icon = notification.category === 'government_update' ? Landmark : Bell;
          return <button
            onClick={() => read(notification)}
            className={`card flex w-full max-w-full gap-3 overflow-hidden p-4 text-left ${!notification.isRead ? 'ring-1 ring-care-200' : ''}`}
            key={notification._id}
          >
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${notification.category === 'government_update' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}><Icon size={19}/></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <strong className="min-w-0 break-words text-sm">{notificationTitle(notification,t)}</strong>
                {!notification.isRead && <i className="mt-1 h-2 w-2 shrink-0 rounded-full bg-care-500"/>}
              </div>
              <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{localizeContent(notification.message,t)}</p>
              <p className="mt-2 text-[10px] font-bold uppercase text-slate-400">{t(notification.category === 'government_update' ? 'governmentUpdate' : 'patientTask')} {notification.sourceUrl && <ExternalLink className="inline" size={10}/>}</p>
            </div>
          </button>;
        })}
    </div>
  </>;
}
