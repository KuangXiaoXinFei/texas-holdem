import { useState, useMemo } from 'react';
import { Plus, Minus, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext, Product } from '../store';

export default function StoreScreen() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'drink' | 'snack' | 'bottle'>('all');
  const { cart, products, addToCart, removeFromCart } = useAppContext();

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'bottle', label: '洋酒/存酒' },
    { id: 'drink', label: '饮品' },
    { id: 'snack', label: '小吃' },
  ];

  const getCartQuantity = (productId: string) => {
    return cart.find(item => item.product.id === productId)?.quantity || 0;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-3 bg-white mb-2"
      >
        <div className="h-32 bg-zinc-900 rounded-xl overflow-hidden relative shadow-md">
           <img 
              src="https://images.unsplash.com/photo-1572116469696-ed70ca2fbc53?q=80&w=600&auto=format&fit=crop" 
              alt="Bar" 
              className="w-full h-full object-cover opacity-60"
            />
           <div className="absolute inset-0 flex flex-col justify-center items-start p-6 text-white space-y-1">
             <span className="bg-amber-500 text-xs px-2 py-1 rounded font-bold tracking-wide">今日特惠</span>
             <h2 className="text-xl font-extrabold shadow-sm">开业狂欢特饮</h2>
             <p className="text-sm opacity-90 drop-shadow">全场积分兑换享 8 折优惠</p>
           </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto px-4 py-3 space-x-3 bg-white sticky top-0 z-10 no-scrollbar border-b border-gray-100">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id 
                ? 'bg-zinc-900 text-amber-400 shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product List */}
      <motion.div 
        className="flex-1 p-4 space-y-4 pb-8"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {filteredProducts.map(product => (
          <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 20 },
              show: { opacity: 1, scale: 1, y: 0 }
            }}
            key={product.id} 
            className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-4 border border-gray-100"
          >
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">{product.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1 mt-1 mb-2">{product.description}</p>
              
              <div className="flex items-center space-x-2 text-sm mt-auto">
                 <span className="font-bold text-amber-500">
                   <Flame size={14} className="inline mr-1 pb-[2px]"/>
                   {product.pricePoints}
                 </span>
                 <span className="text-gray-300">|</span>
                 <span className="font-semibold text-gray-900">¥{product.priceRMB}</span>
              </div>
            </div>

            {/* Add/Reduce Controls */}
            <div className="flex flex-col items-end justify-between h-full py-1">
               <div className="h-6"></div> {/* Spacer */}
               <div className="flex items-center space-x-3">
                 {getCartQuantity(product.id) > 0 && (
                   <>
                     <button 
                       onClick={() => removeFromCart(product.id)}
                       className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                     >
                       <Minus size={16} />
                     </button>
                     <span className="font-medium text-sm w-4 text-center">{getCartQuantity(product.id)}</span>
                   </>
                 )}
                 <button 
                    onClick={() => addToCart(product)}
                    className="w-7 h-7 bg-amber-400 text-zinc-900 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                 >
                   <Plus size={16} strokeWidth={3} />
                 </button>
               </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
