import { CreditCard, Flame, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../store';

export default function CartModal({ onClose }: { onClose: () => void }) {
  const { cart, clearCart, checkout } = useAppContext();
  const totalPoints = cart.reduce((sum, item) => sum + item.product.pricePoints * item.quantity, 0);
  const totalRMB = cart.reduce((sum, item) => sum + item.product.priceRMB * item.quantity, 0);

  const handleCheckout = async (usePoints: boolean) => {
    const success = await checkout(usePoints);
    alert(success ? '支付成功，员工端已生成任务' : '支付失败，余额或积分不足');
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/45 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="关闭购物车" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="absolute bottom-0 flex max-h-[82vh] w-full max-w-md flex-col rounded-t-[30px] bg-[#fffaf1] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#eadcc7] p-5">
          <h2 className="text-xl font-black">已选商品</h2>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e4d3] text-[#2b2521]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-32 no-scrollbar">
          {cart.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-[#8a7a69]">
              <CreditCard size={42} className="mb-3 text-[#d0b48c]" />
              <p className="text-sm font-bold">还没有选择酒水</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-[#2b2521]">{item.product.name}</h3>
                    <p className="mt-1 text-xs font-bold text-[#8a7a69]">数量 x {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#b76e22]">{item.product.pricePoints * item.quantity} 积分</p>
                    <p className="mt-1 text-xs font-bold text-[#2b2521]">¥{item.product.priceRMB * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="absolute bottom-0 w-full border-t border-[#eadcc7] bg-[#fffaf1] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-black text-[#2b2521]">共 {cart.reduce((sum, item) => sum + item.quantity, 0)} 件</span>
              <button onClick={clearCart} className="flex items-center gap-1 text-xs font-black text-[#7f2b1d]">
                <Trash2 size={14} />
                清空
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleCheckout(true)} className="flex items-center justify-center gap-2 rounded-2xl bg-amber-300 py-4 text-sm font-black text-[#1a1a1d]">
                <Flame size={18} />
                {totalPoints} 积分
              </button>
              <button onClick={() => handleCheckout(false)} className="flex items-center justify-center gap-2 rounded-2xl bg-[#1a1a1d] py-4 text-sm font-black text-amber-300">
                <CreditCard size={18} />¥ {totalRMB}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
