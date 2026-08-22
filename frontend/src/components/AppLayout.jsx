import { Gift, Home, Users, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';

export default function AppLayout({ children }) {
  const { t } = useI18n();

  const items = [
    ['/home', Home, 'home'], ['/patients', Users, 'patients'], ['/rewards', Gift, 'rewards'], ['/profile', UserRound, 'profile'],
  ];

  return <main className="app-shell safe-bottom">{children}<nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[460px] -translate-x-1/2 justify-around border-t px-4 pb-[calc(.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">{items.map(([to, Icon, key]) => <NavLink key={to} to={to} className={({ isActive }) => `relative flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold transition ${isActive ? 'bg-care-200 text-white shadow-lg' : 'text-care-100'}`}><Icon size={22}/>{t(key)}</NavLink>)}</nav></main>;
}
