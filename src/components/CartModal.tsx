import { X, Flame, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../store';

export default function CartModal({ onClose }: { onClose: () => void }) {
  const { cart, clearCart, checkout } = useAppContext();

  const totalPoints = cart.reduce((sum, item) => sum + item.product.pricePoints * item.quantity, 0);
  const totalRMB = cart.reduce((sum, item) => sum + item.product.priceRMB * item.quantity, 0);

  const handleCheckout = async (usePoints: boolean) => {
    const success = await checkout(usePoints);
    if (success) {
      alert('支付成功！');
      onClose();
    } else {
      alert('余额不足！');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white rounded-t-3xl h-[80%] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold">已选商品</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800">
             <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-32">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
               <span className="text-6xl">🛒</span>
               <p>购物车还是空的，去选点喝的吧</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">x {item.quantity}</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-amber-500 text-sm flex items-center justify-end">
                       <Flame size={14} className="mr-1"/> {item.product.pricePoints * item.quantity}
                     </p>
                     <p className="text-xs text-gray-400 mt-1">或 ¥{item.product.priceRMB * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {cart.length > 0 && (
          <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-5 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
               <span className="text-gray-500 font-medium">共 {cart.reduce((sum, i) => sum + i.quantity, 0)} 件商品</span>
               <button onClick={clearCart} className="text-sm text-red-500">清空购物车</button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleCheckout(true)}
                className="bg-amber-400 text-zinc-900 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
              >
                <Flame size={20} />
                <span>{totalPoints} 积分兑换</span>
              </button>
              <button 
                onClick={() => handleCheckout(false)}
                className="bg-zinc-900 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
              >
                <CreditCard size={20} />
                <span>¥ {totalRMB} 支付</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
