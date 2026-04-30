import { CheckCircle2, ClipboardCheck, ConciergeBell, TicketCheck, Wine } from 'lucide-react';
import { ReactNode } from 'react';
import { useAppContext, StaffTask } from '../store';

const iconMap: Record<StaffTask['type'], ReactNode> = {
  seat: <ConciergeBell size={20} />,
  order: <ClipboardCheck size={20} />,
  drink: <Wine size={20} />,
  coupon: <TicketCheck size={20} />,
};

export default function StaffScreen() {
  const { user, staffTasks, completeStaffTask } = useAppContext();
  const pending = staffTasks.filter(task => task.status === 'pending').length;

  return (
    <div className="space-y-4 p-4">
      <section className="rounded-[28px] bg-[#7f2b1d] p-5 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-100">Staff Console</p>
        <h2 className="mt-3 text-2xl font-black">员工端核销</h2>
        <p className="mt-2 text-sm text-white/70">当前登录角色：{user?.role ?? 'member'}，待处理 {pending} 项。</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#8a7a69]">淘汰 / 确认入座</p>
          <p className="mt-2 text-2xl font-black text-[#2b2521]">{staffTasks.filter(task => task.type === 'seat' && task.status === 'pending').length}</p>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#8a7a69]">卡券 / 出品核销</p>
          <p className="mt-2 text-2xl font-black text-[#2b2521]">{staffTasks.filter(task => task.type !== 'seat' && task.status === 'pending').length}</p>
        </div>
      </section>

      <section className="space-y-3">
        {staffTasks.map(task => (
          <article key={task.id} className={`rounded-3xl border p-4 shadow-sm ${task.status === 'done' ? 'border-[#e9ddce] bg-[#f6f1e8] opacity-70' : 'border-[#eadcc7] bg-white'}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a1a1d] text-amber-300">{iconMap[task.type]}</div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black text-[#2b2521]">{task.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#8a7a69]">{task.subtitle}</p>
                <p className="mt-1 text-[11px] font-bold text-[#b76e22]">{task.createdAt}</p>
              </div>
              {task.status === 'done' && <CheckCircle2 className="text-[#163b34]" size={22} />}
            </div>
            {task.status === 'pending' && (
              <button onClick={async () => alert((await completeStaffTask(task.id)) ? '处理完成' : '处理失败')} className="mt-4 w-full rounded-2xl bg-[#1a1a1d] py-3 text-sm font-black text-amber-300">
                确认完成
              </button>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
