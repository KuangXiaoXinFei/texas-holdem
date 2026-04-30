import { Clock, Flame, Trophy, Users } from 'lucide-react';
import { ReactNode } from 'react';
import { useAppContext } from '../store';

export default function TournamentScreen() {
  const { user, tournaments, leaderboard, registerTournament } = useAppContext();

  const handleRegister = async (id: string, buyIn: number) => {
    if (!user) return;
    if (user.points < buyIn) {
      alert('积分不足，无法报名');
      return;
    }
    alert((await registerTournament(id)) ? '报名成功，请准时到场' : '报名失败，可能已报名或名额已满');
  };

  if (!user) return <div className="p-4 text-center text-[#8a7a69]">加载中...</div>;

  return (
    <div className="space-y-4 p-4">
      <section className="rounded-[28px] bg-[#163b34] p-5 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-200">Leaderboard</p>
        <h2 className="mt-3 text-2xl font-black">赛事与排行榜</h2>
        <p className="mt-2 text-sm text-white/65">报名扣积分，成绩分用于榜单展示。</p>
      </section>

      <section className="rounded-3xl border border-[#eadcc7] bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-black">本周积分榜</h3>
        <div className="space-y-3">
          {leaderboard.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${index < 3 ? 'bg-[#1a1a1d] text-amber-300' : 'bg-[#f0e4d3] text-[#7a6c5f]'}`}>{index + 1}</span>
              <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full bg-[#f5ead8]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{item.name}</p>
                <p className="text-xs text-[#8a7a69]">{item.level}</p>
              </div>
              <span className="text-sm font-black text-[#163b34]">{item.rankScore}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {tournaments.map(tournament => {
          const isRegistered = user.registeredTournaments.includes(tournament.id);
          const isFull = tournament.players >= tournament.maxPlayers;
          const disabled = isRegistered || isFull || tournament.status !== 'registering';
          return (
            <article key={tournament.id} className="rounded-3xl border border-[#eadcc7] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-[#2b2521]">{tournament.name}</h3>
                  <p className="mt-1 text-xs font-bold text-[#b76e22]">{tournament.prize}</p>
                </div>
                <span className="rounded-full bg-[#163b34]/10 px-3 py-1 text-xs font-black text-[#163b34]">{tournament.status === 'registering' ? '报名中' : tournament.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Info icon={<Clock size={15} />} value={tournament.time} />
                <Info icon={<Users size={15} />} value={`${tournament.players}/${tournament.maxPlayers} 人`} />
                <Info icon={<Flame size={15} />} value={`${tournament.buyInPoints} 积分`} />
                <Info icon={<Trophy size={15} />} value={`盲注 ${tournament.blind}`} />
              </div>
              <button
                disabled={disabled}
                onClick={() => handleRegister(tournament.id, tournament.buyInPoints)}
                className="mt-4 w-full rounded-2xl bg-[#1a1a1d] py-3 text-sm font-black text-amber-300 disabled:bg-[#d8c8b4] disabled:text-white"
              >
                {isRegistered ? '已报名' : isFull ? '名额已满' : '立即报名'}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Info({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[#f6f1e8] px-3 py-2 font-bold text-[#6f6255]">
      {icon}
      <span>{value}</span>
    </div>
  );
}
