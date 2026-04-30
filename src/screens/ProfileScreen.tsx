import { CalendarClock, CheckCircle2, ChevronRight, CreditCard, Gift, MessageCircle, Share2, Shield, Wallet, Wine } from 'lucide-react';
import { ReactNode } from 'react';
import { useState } from 'react';
import { useAppContext } from '../store';

export default function ProfileScreen() {
  const { user, storedDrinks, reservations, orders, recharge, createReservation, requestDrink, inviteFriend } = useAppContext();
  const [guests, setGuests] = useState(6);
  const [tableType, setTableType] = useState('标准德州桌');
  const [timeSlot, setTimeSlot] = useState('今晚 20:00');

  if (!user) return <div className="p-4 text-center text-[#8a7a69]">加载中...</div>;

  const submitReservation = async () => {
    const ok = await createReservation({ tableType, guests, timeSlot, note: '小程序预约' });
    alert(ok ? '预约成功，已进入候桌队列' : '预约失败');
  };

  return (
    <div className="space-y-4 p-4">
      <section className="rounded-[28px] bg-[#1a1a1d] p-5 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full border-2 border-amber-300 bg-white" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-black">{user.name}</h2>
            <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-200">
              <Shield size={13} />
              {user.level}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Balance label="可用积分" value={user.points.toLocaleString()} />
          <Balance label="账户余额" value={`¥${user.balanceRMB}`} />
          <Balance label="连续签到" value={`${user.checkinStreak}天`} />
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2">
        {[200, 500, 1000, 2000].map(amount => (
          <button key={amount} onClick={async () => alert((await recharge(amount)) ? `充值 ${amount} 元成功` : '充值失败')} className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <Wallet className="mx-auto mb-2 text-[#b76e22]" size={20} />
            <span className="text-xs font-black">充 {amount}</span>
          </button>
        ))}
      </section>

      <section className="rounded-3xl border border-[#eadcc7] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock size={20} className="text-[#b76e22]" />
          <h3 className="font-black">预约 / 候桌</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select value={tableType} onChange={event => setTableType(event.target.value)} className="rounded-2xl border border-[#eadcc7] bg-[#fffaf1] px-3 py-3 text-xs font-bold">
            <option>标准德州桌</option>
            <option>VIP 包厢桌</option>
            <option>吧台观赛位</option>
          </select>
          <select value={guests} onChange={event => setGuests(Number(event.target.value))} className="rounded-2xl border border-[#eadcc7] bg-[#fffaf1] px-3 py-3 text-xs font-bold">
            {[2, 4, 6, 8, 10].map(n => <option key={n}>{n}</option>)}
          </select>
          <select value={timeSlot} onChange={event => setTimeSlot(event.target.value)} className="rounded-2xl border border-[#eadcc7] bg-[#fffaf1] px-3 py-3 text-xs font-bold">
            <option>今晚 20:00</option>
            <option>今晚 21:30</option>
            <option>明晚 19:30</option>
          </select>
        </div>
        <button onClick={submitReservation} className="mt-3 w-full rounded-2xl bg-[#1a1a1d] py-3 text-sm font-black text-amber-300">提交预约</button>
        <div className="mt-4 space-y-2">
          {reservations.slice(0, 3).map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#f6f1e8] p-3">
              <div>
                <p className="text-sm font-black">#{item.queueNo} {item.tableType}</p>
                <p className="text-xs text-[#8a7a69]">{item.guests} 人 · {item.timeSlot}</p>
              </div>
              <span className="rounded-full bg-[#163b34]/10 px-3 py-1 text-xs font-black text-[#163b34]">{item.status === 'seated' ? '已入座' : '候桌中'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#eadcc7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-black"><Wine size={20} className="text-[#7f2b1d]" />我的存酒</h3>
          <span className="text-xs font-bold text-[#8a7a69]">{storedDrinks.length} 瓶</span>
        </div>
        <div className="space-y-2">
          {storedDrinks.map(drink => (
            <div key={drink.id} className="flex items-center justify-between rounded-2xl bg-[#f6f1e8] p-3">
              <div>
                <p className="text-sm font-black">{drink.name}</p>
                <p className="text-xs text-[#8a7a69]">剩余 {drink.volumeLeft} · 至 {drink.expiryDate}</p>
              </div>
              <button disabled={drink.status !== 'stored'} onClick={async () => alert((await requestDrink(drink.id)) ? '已通知员工取酒' : '操作失败')} className="rounded-full bg-[#7f2b1d] px-3 py-2 text-xs font-black text-white disabled:bg-[#d8c8b4]">
                {drink.status === 'stored' ? '提取' : drink.status === 'requested' ? '待取' : '已取'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#eadcc7] bg-white shadow-sm">
        <MenuItem icon={<CreditCard size={19} />} title="订单记录" value={`${orders.length} 笔`} />
        <MenuItem icon={<Gift size={19} />} title="卡券兑换" value="pro 预留" />
        <MenuItem icon={<MessageCircle size={19} />} title="联系客服" value="RiverAceClub" />
        <button onClick={async () => alert((await inviteFriend()) ? '已发放邀请奖励' : '邀请失败')} className="flex w-full items-center justify-between p-4">
          <span className="flex items-center gap-3 text-sm font-black"><Share2 size={19} className="text-[#b76e22]" />邀请好友</span>
          <ChevronRight size={16} className="text-[#8a7a69]" />
        </button>
      </section>

      <section className="rounded-3xl border border-[#eadcc7] bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-black">最近订单</h3>
        <div className="space-y-2">
          {orders.slice(0, 4).map(order => (
            <div key={order.id} className="flex items-center justify-between rounded-2xl bg-[#f6f1e8] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{order.items.map(item => `${item.name}x${item.quantity}`).join('、')}</p>
                <p className="text-xs text-[#8a7a69]">{order.createdAt}</p>
              </div>
              <span className="ml-3 flex items-center gap-1 text-xs font-black text-[#163b34]"><CheckCircle2 size={14} />{order.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Balance({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-[10px] font-bold text-white/55">{label}</p>
      <p className="mt-1 truncate text-base font-black">{value}</p>
    </div>
  );
}

function MenuItem({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#eadcc7] p-4">
      <span className="flex items-center gap-3 text-sm font-black text-[#2b2521]">{icon}{title}</span>
      <span className="text-xs font-bold text-[#8a7a69]">{value}</span>
    </div>
  );
}
