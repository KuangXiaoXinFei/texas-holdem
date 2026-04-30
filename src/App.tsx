/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode } from 'react';
import { Home, Trophy, User as UserIcon, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './store';
import StoreScreen from './screens/StoreScreen';
import TournamentScreen from './screens/TournamentScreen';
import ProfileScreen from './screens/ProfileScreen';
import CartModal from './components/CartModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'store' | 'tournaments' | 'profile'>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useAppContext();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-screen w-full justify-center bg-gray-100 overflow-hidden font-sans text-gray-900">
      {/* Mobile Simulator Container */}
      <div className="relative h-full w-full max-w-md bg-gray-50 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-zinc-900 text-white px-4 pt-12 pb-4 flex justify-between items-center z-10 sticky top-0 shadow-md">
          <h1 className="text-xl font-bold tracking-wider">ACE CLUB</h1>
          {activeTab === 'store' && (
             <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors"
              >
               <ShoppingCart size={24} />
               <AnimatePresence>
                 {totalCartItems > 0 && (
                   <motion.span 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     exit={{ scale: 0 }}
                     className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1"
                   >
                     {totalCartItems}
                   </motion.span>
                 )}
               </AnimatePresence>
             </button>
          )}
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto w-full pb-20 scroll-smooth relative no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <div className="h-full overflow-y-auto pb-24">
                {activeTab === 'store' && <StoreScreen />}
                {activeTab === 'tournaments' && <TournamentScreen />}
                {activeTab === 'profile' && <ProfileScreen />}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center pt-2 px-2 z-20 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <NavItem 
            icon={<Home size={24} />} 
            label="门店" 
            isActive={activeTab === 'store'} 
            onClick={() => setActiveTab('store')} 
          />
          <NavItem 
            icon={<Trophy size={24} />} 
            label="赛事" 
            isActive={activeTab === 'tournaments'} 
            onClick={() => setActiveTab('tournaments')} 
          />
          <NavItem 
            icon={<UserIcon size={24} />} 
            label="我的" 
            isActive={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>

        {/* Modals */}
        <AnimatePresence>
          {isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${isActive ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
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