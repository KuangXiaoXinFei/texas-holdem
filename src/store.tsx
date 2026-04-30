import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Types ---
export interface Product {
  id: string;
  name: string;
  description: string;
  pricePoints: number;
  priceRMB: number;
  image: string;
  category: 'drink' | 'snack' | 'bottle';
}

export interface Tournament {
  id: string;
  name: string;
  time: string;
  buyInPoints: number;
  blind: string;
  players: number;
  maxPlayers: number;
  status: 'registering' | 'ongoing' | 'finished';
}

export interface StoredDrink {
  id: string;
  userId: string;
  name: string;
  volumeLeft: string;
  storedDate: string;
  expiryDate: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  level: string;
  points: number;
  balanceRMB: number;
  registeredTournaments: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// --- Context ---
interface AppContextType {
  user: User | null;
  products: Product[];
  storedDrinks: StoredDrink[];
  cart: CartItem[];
  tournaments: Tournament[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (usePoints: boolean) => Promise<boolean>;
  registerTournament: (tournamentId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [storedDrinks, setStoredDrinks] = useState<StoredDrink[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    // Default logged in user id for demo
    const userId = 'u1';
    
    Promise.all([
      fetch(`/api/users/${userId}`).then(res => res.json()),
      fetch('/api/products').then(res => res.json()),
      fetch('/api/tournaments').then(res => res.json()),
      fetch(`/api/users/${userId}/drinks`).then(res => res.json())
    ]).then(([userData, productsData, tournamentsData, drinksData]) => {
      setUser(userData);
      setProducts(productsData);
      setTournaments(tournamentsData);
      setStoredDrinks(drinksData);
    }).catch(err => console.error("Failed to load initial data", err));
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.product.id !== productId);
    });
  };

  const clearCart = () => setCart([]);

  const checkout = async (usePoints: boolean) => {
    if (!user) return false;
    
    const totalPoints = cart.reduce((sum, item) => sum + item.product.pricePoints * item.quantity, 0);
    const totalRMB = cart.reduce((sum, item) => sum + item.product.priceRMB * item.quantity, 0);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, totalPoints, totalRMB, usePoints })
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        clearCart();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const registerTournament = async (tournamentId: string) => {
    if (!user) return false;

    try {
      const res = await fetch('/api/tournaments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, tournamentId })
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        
        // Update tournaments list with the updated tournament
        setTournaments(prev => prev.map(t => 
          t.id === tournamentId ? data.tournament : t
        ));
        
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ user, products, storedDrinks, cart, tournaments, addToCart, removeFromCart, clearCart, checkout, registerTournament }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
