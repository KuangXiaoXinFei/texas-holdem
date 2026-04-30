import { Shield, Flame, Wallet, Wine, History, ChevronRight, Settings } from 'lucide-react';
import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../store';

export default function ProfileScreen() {
  const { user, storedDrinks } = useAppContext();

  if (!user) return <div className="p-4 pt-10 text-center text-gray-500">加载中...</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-4 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* User Card */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center space-x-4">
             <div className="w-16 h-16 bg-zinc-800 border-2 border-amber-500 rounded-full overflow-hidden p-1 shadow-inner">
                <img src={user.avatar} alt="Avatar" className="w-full h-full bg-white rounded-full object-cover" />
             </div>
             <div>
               <h2 className="text-xl font-extrabold tracking-wide mb-1 flex items-center gap-2">
                 {user.name}
                 <Shield size={16} className="text-amber-500" />
               </h2>
               <span className="text-xs font-semibold bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
                 {user.level}
               </span>
             </div>
           </div>
           <button className="text-gray-400 hover:text-white">
             <Settings size={20} />
           </button>
        </div>

        {/* Wealth Data */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
           <div>
             <p className="text-zinc-400 text-xs mb-1">可用积分</p>
             <div className="flex items-end font-bold text-2xl text-amber-400">
               <Flame size={20} className="mr-1 mb-1 shadow-sm" />
               {user.points}
             </div>
           </div>
           <div>
             <p className="text-zinc-400 text-xs mb-1">可用余额 (元)</p>
             <div className="flex items-end font-bold text-2xl">
               <span className="text-base mr-1 mb-0.5">¥</span>
               {user.balanceRMB}
             </div>
           </div>
        </div>
      </motion.div>

      {/* Action Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
         <ActionCard icon={<Wallet size={24} className="text-blue-500" />} label="充值/买单" />
         <ActionCard icon={<History size={24} className="text-purple-500" />} label="积分账单" />
         <ActionCard icon={<Wine size={24} className="text-rose-500" />} label="存酒记录" badge={storedDrinks.length > 0 ? storedDrinks.length.toString() : undefined} />
      </motion.div>

      {/* Stored Drinks List */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <Wine size={18} className="text-gray-800" />
            我的存酒
          </h3>
          <button className="text-sm text-gray-500 flex items-center">
            全部 <ChevronRight size={14} />
          </button>
        </div>
        <div>
          {storedDrinks.length === 0 ? (
            <div className="p-6 flex flex-col items-center justify-center text-gray-400">
               <Wine size={32} className="mb-2 opacity-50" />
               <p className="text-sm">暂无存酒记录</p>
            </div>
          ) : storedDrinks.map(drink => (
             <div key={drink.id} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    🍾
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{drink.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">剩余 {drink.volumeLeft}</p>
                  </div>
               </div>
               <div className="text-right flex flex-col items-end">
                 <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded font-medium mb-2">
                   去提取
                 </span>
                 <p className="text-[10px] text-gray-400">至 {drink.expiryDate}</p>
               </div>
             </div>
          ))}
        </div>
      </motion.div>
      
      {/* Settings List */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 mb-2">
         <ListItem title="我的二维码 / 入场凭证" />
         <ListItem title="消息中心" badge="3" />
         <ListItem title="联系客服 / 包房预订" isLast />
      </motion.div>
    </motion.div>
  );
}

function ActionCard({ icon, label, badge }: { icon: ReactNode, label: string, badge?: string }) {
  return (
    <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative active:scale-95 transition-transform">
      {badge && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
          {badge}
        </span>
      )}
      <div className="mb-2 bg-gray-50 p-3 rounded-full">{icon}</div>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </button>
  );
}

function ListItem({ title, badge, isLast = false }: { title: string, badge?: string, isLast?: boolean }) {
  return (
    <button className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-50' : ''}`}>
       <span className="font-semibold text-gray-800 text-sm">{title}</span>
       <div className="flex items-center space-x-2">
         {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
         <ChevronRight size={16} className="text-gray-300" />
       </div>
    </button>
  );
}
