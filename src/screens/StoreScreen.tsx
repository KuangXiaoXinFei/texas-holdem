import { Minus, Plus, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCategory, useAppContext } from '../store';

const categories: Array<{ id: 'all' | ProductCategory; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'bottle', label: '存酒' },
  { id: 'drink', label: '饮品' },
  { id: 'snack', label: '小食' },
  { id: 'card', label: '实体卡' },
];

export default function StoreScreen() {
  const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('all');
  const { cart, products, addToCart, removeFromCart } = useAppContext();
  const filteredProducts = useMemo(() => (activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory)), [activeCategory, products]);

  const getCartQuantity = (productId: string) => cart.find(item => item.product.id === productId)?.quantity || 0;

  return (
    <div className="space-y-4 p-4">
      <section className="rounded-[28px] bg-[#1a1a1d] p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">Bar Menu</p>
            <h2 className="mt-3 text-2xl font-black">酒水点单</h2>
            <p className="mt-2 text-sm text-white/65">余额支付返积分，积分兑换直接扣减。</p>
          </div>
          <div className="rounded-2xl bg-amber-300 p-3 text-[#1a1a1d]">
            <Sparkles size={24} />
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${activeCategory === cat.id ? 'bg-[#1a1a1d] text-amber-300' : 'border border-[#eadcc7] bg-white text-[#7a6c5f]'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredProducts.map(product => (
          <article key={product.id} className="grid grid-cols-[96px_1fr] gap-3 rounded-3xl border border-[#eadcc7] bg-white p-3 shadow-sm">
            <img src={product.image} alt={product.name} className="h-24 w-24 rounded-2xl object-cover" />
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-[#2b2521]">{product.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8a7a69]">{product.description}</p>
                </div>
                {product.canStore && <span className="rounded-full bg-[#163b34]/10 px-2 py-1 text-[10px] font-black text-[#163b34]">可存</span>}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-[#b76e22]">{product.pricePoints} 积分</p>
                  <p className="text-xs font-bold text-[#2b2521]">¥{product.priceRMB}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getCartQuantity(product.id) > 0 && (
                    <>
                      <button onClick={() => removeFromCart(product.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0e4d3] text-[#2b2521]">
                        <Minus size={16} />
                      </button>
                      <span className="w-5 text-center text-sm font-black">{getCartQuantity(product.id)}</span>
                    </>
                  )}
                  <button onClick={() => addToCart(product)} className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-[#1a1a1d]">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
