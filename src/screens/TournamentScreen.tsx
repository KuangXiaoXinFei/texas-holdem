import { Trophy, Clock, Users, Flame, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../store';

export default function TournamentScreen() {
  const { user, tournaments, registerTournament } = useAppContext();

  const handleRegister = async (id: string, buyIn: number) => {
    if (!user) return;
    if (user.points < buyIn) {
      alert('积分不足，无法报名该赛事！');
      return;
    }
    const success = await registerTournament(id);
    if (success) {
      alert('报名成功！请准时参赛。');
    } else {
      alert('报名失败（可能是人数已满或已报名）。');
    }
  };

  if (!user) return <div className="p-4 pt-10 text-center text-gray-500">加载中...</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Trophy size={100} />
         </div>
         <h2 className="text-lg font-bold mb-1">今日赛事概览</h2>
         <p className="text-zinc-400 text-sm mb-4">争夺最高荣誉与丰厚积分奖励</p>
         <div className="flex items-center space-x-2 text-amber-400 text-sm font-bold bg-amber-400/10 inline-flex px-3 py-1.5 rounded-full">
            <Flame size={16} />
            <span>我的可用积分: {user.points}</span>
         </div>
      </motion.div>

      {/* Tournament List */}
      <motion.div 
        className="space-y-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {tournaments.map(tournament => {
          const isRegistered = user.registeredTournaments.includes(tournament.id);
          const isFull = tournament.players >= tournament.maxPlayers;
          const isOngoing = tournament.status === 'ongoing';

          let statusBadge = (
             <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">报名中</span>
          );
          if (isOngoing) statusBadge = <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">进行中</span>;
          
          return (
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              key={tournament.id} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                     {tournament.name}
                     {statusBadge}
                   </h3>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 mb-5">
                 <div className="flex items-center space-x-2">
                   <Clock size={16} className="text-gray-400" />
                   <span>{tournament.time}</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Info size={16} className="text-gray-400" />
                   <span>盲注 {tournament.blind}</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Users size={16} className="text-gray-400" />
                   <span>
                     {tournament.players}/{tournament.maxPlayers} 人
                   </span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Flame size={16} className="text-amber-500" />
                   <span className="font-semibold text-gray-900">买入：{tournament.buyInPoints}</span>
                 </div>
               </div>

               {/* Action Button */}
               <button 
                 onClick={() => handleRegister(tournament.id, tournament.buyInPoints)}
                 disabled={isRegistered || isFull || isOngoing}
                 className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                   isRegistered 
                     ? 'bg-green-100 text-green-700 cursor-not-allowed'
                     : isOngoing
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     : isFull
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     : 'bg-zinc-900 text-amber-400 active:scale-95 hover:bg-zinc-800'
                 }`}
               >
                 {isRegistered ? (
                   <><span>已报名</span></>
                 ) : isOngoing ? (
                   <span>比赛已开始</span>
                 ) : isFull ? (
                   <span>名额已满</span>
                 ) : (
                   <>
                     <Trophy size={18} />
                     <span>立即参赛报名</span>
                   </>
                 )}
               </button>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  );
}
