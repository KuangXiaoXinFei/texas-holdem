import { CalendarClock, Gift, Headphones, MapPin, QrCode, ReceiptText, Share2, Trophy, UserCheck, Wallet, Wine } from 'lucide-react';
import { TabKey } from '../App';
import { useAppContext } from '../store';

export default function HomeScreen({ setActiveTab }: { setActiveTab: (tab: TabKey) => void }) {
  const { user, reservations, leaderboard, checkin, inviteFriend } = useAppContext();
  const waiting = reservations.find(item => item.status === 'waiting');
  const checkedInToday = user?.lastCheckinDate === new Date().toISOString().slice(0, 10);

  const actions = [
    { label: '签到', icon: QrCode, onClick: async () => alert((await checkin()) ? '签到成功，积分已到账' : '今天已经签到') },
    { label: '存/提积分', icon: Wallet, onClick: () => setActiveTab('profile') },
    { label: '存/取酒', icon: Wine, onClick: () => setActiveTab('profile') },
    { label: '点单', icon: ReceiptText, onClick: () => setActiveTab('store') },
    { label: '预约', icon: CalendarClock, onClick: () => setActiveTab('profile') },
    { label: '候桌', icon: UserCheck, onClick: () => setActiveTab('profile') },
    { label: '排行榜', icon: Trophy, onClick: () => setActiveTab('tournaments') },
    { label: '充值中心', icon: Gift, onClick: () => setActiveTab('profile') },
    { label: '订单', icon: ReceiptText, onClick: () => setActiveTab('profile') },
    { label: '联系客服', icon: Headphones, onClick: () => alert('客服微信：RiverAceClub') },
    { label: '门店导航', icon: MapPin, onClick: () => alert('模拟打开腾讯地图：RIVER ACE 酒吧') },
    { label: '邀请好友', icon: Share2, onClick: async () => alert((await inviteFriend()) ? '邀请奖励 188 积分已发放' : '邀请失败') },
  ];

  return (
    <div className="space-y-5 p-4">
      <section className="relative overflow-hidden rounded-[28px] bg-[#222225] text-white shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1572116469696-ed70ca2fbc53?q=80&w=900&auto=format&fit=crop"
          alt="bar"
          className="h-52 w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="mb-3 inline-flex rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-200">
            标准版功能已接通
          </div>
          <h2 className="text-3xl font-black leading-tight">今晚开局，入座前全部搞定</h2>
          <p className="mt-2 text-sm text-white/75">签到、点单、预约候桌、存酒提酒、员工确认都可本地联调。</p>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3">
        {actions.map(action => (
          <button key={action.label} onClick={action.onClick} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-[#eadcc7] bg-white text-[#2b2521] shadow-sm active:scale-95">
            <action.icon size={22} className="text-[#b76e22]" />
            <span className="text-xs font-black">{action.label}</span>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-[#163b34] p-4 text-white">
          <p className="text-xs font-bold text-emerald-200">候桌状态</p>
          <p className="mt-3 text-2xl font-black">{waiting ? `#${waiting.queueNo}` : '无排队'}</p>
          <p className="mt-1 text-xs text-white/65">{waiting ? `${waiting.tableType} · ${waiting.timeSlot}` : '可直接发起预约'}</p>
        </div>
        <div className="rounded-3xl bg-[#7f2b1d] p-4 text-white">
          <p className="text-xs font-bold text-orange-100">今日签到</p>
          <p className="mt-3 text-2xl font-black">{checkedInToday ? '已完成' : '待签到'}</p>
          <p className="mt-1 text-xs text-white/65">连续 {user?.checkinStreak ?? 0} 天</p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#eadcc7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-black">本周排行榜</h3>
          <button onClick={() => setActiveTab('tournaments')} className="text-xs font-bold text-[#b76e22]">查看赛事</button>
        </div>
        <div className="space-y-3">
          {leaderboard.slice(0, 3).map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1d] text-xs font-black text-amber-300">{index + 1}</span>
              <img src={item.avatar} alt={item.name} className="h-9 w-9 rounded-full bg-[#f5ead8]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{item.name}</p>
                <p className="text-xs text-[#8a7a69]">{item.level}</p>
              </div>
              <span className="text-sm font-black text-[#163b34]">{item.rankScore}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
