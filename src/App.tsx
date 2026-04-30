import { ReactNode, useState } from 'react';
import { CalendarClock, Crown, Home, ListChecks, ShoppingBag, Sparkles, Trophy, UserRound } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useAppContext } from './store';
import HomeScreen from './screens/HomeScreen';
import StoreScreen from './screens/StoreScreen';
import TournamentScreen from './screens/TournamentScreen';
import ProfileScreen from './screens/ProfileScreen';
import StaffScreen from './screens/StaffScreen';
import CartModal from './components/CartModal';

export type TabKey = 'home' | 'store' | 'tournaments' | 'profile' | 'staff';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, loading, user } = useAppContext();
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen w-full bg-[#171719] text-slate-950 sm:py-4">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[#f6f1e8] shadow-2xl sm:min-h-[860px] sm:rounded-[28px]">
        <header className="relative overflow-hidden bg-[#1a1a1d] px-5 pb-5 pt-12 text-white">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute left-[-80px] top-[-80px] h-48 w-48 rounded-full bg-amber-500/25 blur-3xl" />
            <div className="absolute bottom-[-80px] right-[-60px] h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">Texas Lounge</p>
              <h1 className="mt-2 text-2xl font-black tracking-wide">RIVER ACE 酒吧</h1>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-amber-200 backdrop-blur"
              aria-label="打开购物车"
            >
              <ShoppingBag size={21} />
              <AnimatePresence>
                {totalCartItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e14d2a] px-1 text-[11px] font-black text-white"
                  >
                    {totalCartItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <div className="relative mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/20 p-2 backdrop-blur">
            <Metric label="积分" value={user ? user.points.toLocaleString() : '-'} />
            <Metric label="余额" value={user ? `¥${user.balanceRMB}` : '-'} />
            <Metric label="等级" value={user?.level ?? '-'} />
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto pb-24 no-scrollbar">
          {loading ? (
            <div className="flex h-full min-h-[520px] flex-col items-center justify-center gap-3 text-[#7a6c5f]">
              <Sparkles className="animate-pulse text-amber-500" />
              <span className="text-sm font-semibold">正在连接本地云服务...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'home' && <HomeScreen setActiveTab={setActiveTab} />}
                {activeTab === 'store' && <StoreScreen />}
                {activeTab === 'tournaments' && <TournamentScreen />}
                {activeTab === 'profile' && <ProfileScreen />}
                {activeTab === 'staff' && <StaffScreen />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-md -translate-x-1/2 grid-cols-5 border-t border-black/10 bg-[#fffaf1]/95 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 shadow-[0_-16px_36px_rgba(0,0,0,0.12)] backdrop-blur sm:bottom-4 sm:rounded-b-[28px]">
          <NavItem icon={<Home size={22} />} label="首页" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<ShoppingBag size={22} />} label="点单" active={activeTab === 'store'} onClick={() => setActiveTab('store')} />
          <NavItem icon={<Trophy size={22} />} label="赛事" active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} />
          <NavItem icon={<UserRound size={22} />} label="我的" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavItem icon={<ListChecks size={22} />} label="员工" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />
        </nav>

        <AnimatePresence>{isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}</AnimatePresence>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <p className="text-[10px] font-semibold text-white/55">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition ${active ? 'bg-[#1a1a1d] text-amber-300' : 'text-[#8a7a69]'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
