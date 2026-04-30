import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type ProductCategory = 'drink' | 'snack' | 'bottle' | 'card';
export type ReservationStatus = 'waiting' | 'seated' | 'cancelled';
export type OrderStatus = 'pending' | 'paid' | 'served' | 'cancelled';
export type StaffTaskStatus = 'pending' | 'done';

export interface Product {
  id: string;
  name: string;
  description: string;
  pricePoints: number;
  priceRMB: number;
  image: string;
  category: ProductCategory;
  canStore: boolean;
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
  prize: string;
}

export interface StoredDrink {
  id: string;
  userId: string;
  name: string;
  volumeLeft: string;
  storedDate: string;
  expiryDate: string;
  status: 'stored' | 'requested' | 'picked';
}

export interface User {
  id: string;
  openId: string;
  name: string;
  avatar: string;
  level: string;
  points: number;
  balanceRMB: number;
  rankScore: number;
  checkinStreak: number;
  lastCheckinDate: string | null;
  registeredTournaments: string[];
  role: 'member' | 'staff' | 'admin';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Reservation {
  id: string;
  userId: string;
  tableType: string;
  guests: number;
  timeSlot: string;
  status: ReservationStatus;
  queueNo: number;
  note: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{ name: string; quantity: number; priceRMB: number; pricePoints: number }>;
  totalRMB: number;
  totalPoints: number;
  paidBy: 'points' | 'balance';
  status: OrderStatus;
  createdAt: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: string;
  rankScore: number;
}

export interface StaffTask {
  id: string;
  type: 'seat' | 'order' | 'drink' | 'coupon';
  title: string;
  subtitle: string;
  status: StaffTaskStatus;
  createdAt: string;
}

interface AppContextType {
  user: User | null;
  products: Product[];
  storedDrinks: StoredDrink[];
  cart: CartItem[];
  tournaments: Tournament[];
  reservations: Reservation[];
  orders: Order[];
  leaderboard: LeaderboardUser[];
  staffTasks: StaffTask[];
  loading: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (usePoints: boolean) => Promise<boolean>;
  registerTournament: (tournamentId: string) => Promise<boolean>;
  checkin: () => Promise<boolean>;
  recharge: (amount: number) => Promise<boolean>;
  createReservation: (payload: Pick<Reservation, 'tableType' | 'guests' | 'timeSlot' | 'note'>) => Promise<boolean>;
  requestDrink: (drinkId: string) => Promise<boolean>;
  inviteFriend: () => Promise<boolean>;
  completeStaffTask: (taskId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const DEMO_LOGIN_CODE = 'local-wechat-code';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [storedDrinks, setStoredDrinks] = useState<StoredDrink[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const login = await api<{ token: string; user: User }>('/api/auth/wechat-login', {
      method: 'POST',
      body: JSON.stringify({ code: DEMO_LOGIN_CODE }),
    });
    const userId = login.user.id;
    const [productsData, tournamentsData, drinksData, reservationsData, ordersData, leaderboardData, staffTasksData] =
      await Promise.all([
        api<Product[]>('/api/products'),
        api<Tournament[]>('/api/tournaments'),
        api<StoredDrink[]>(`/api/users/${userId}/drinks`),
        api<Reservation[]>(`/api/users/${userId}/reservations`),
        api<Order[]>(`/api/users/${userId}/orders`),
        api<LeaderboardUser[]>('/api/leaderboard'),
        api<StaffTask[]>('/api/staff/tasks'),
      ]);

    setUser(login.user);
    setProducts(productsData);
    setTournaments(tournamentsData);
    setStoredDrinks(drinksData);
    setReservations(reservationsData);
    setOrders(ordersData);
    setLeaderboard(leaderboardData);
    setStaffTasks(staffTasksData);
  }, []);

  useEffect(() => {
    refresh()
      .catch(err => console.error('Failed to load app data', err))
      .finally(() => setLoading(false));
  }, [refresh]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
      }
      return prev.filter(item => item.product.id !== productId);
    });
  };

  const clearCart = () => setCart([]);

  const checkout = async (usePoints: boolean) => {
    if (!user || cart.length === 0) return false;
    try {
      const data = await api<{ success: boolean; user: User; order: Order; staffTasks: StaffTask[] }>('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
          paidBy: usePoints ? 'points' : 'balance',
        }),
      });
      setUser(data.user);
      setOrders(prev => [data.order, ...prev]);
      setStaffTasks(data.staffTasks);
      clearCart();
      return data.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const registerTournament = async (tournamentId: string) => {
    if (!user) return false;
    try {
      const data = await api<{ success: boolean; user: User; tournament: Tournament }>('/api/tournaments/register', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, tournamentId }),
      });
      setUser(data.user);
      setTournaments(prev => prev.map(t => (t.id === tournamentId ? data.tournament : t)));
      return data.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const checkin = async () => {
    if (!user) return false;
    try {
      const data = await api<{ success: boolean; user: User }>('/api/checkin', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
      });
      setUser(data.user);
      return data.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const recharge = async (amount: number) => {
    if (!user) return false;
    try {
      const data = await api<{ success: boolean; user: User; order: Order }>('/api/recharge', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, amount }),
      });
      setUser(data.user);
      setOrders(prev => [data.order, ...prev]);
      return data.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const createReservation = async (payload: Pick<Reservation, 'tableType' | 'guests' | 'timeSlot' | 'note'>) => {
    if (!user) return false;
    try {
      const data = await api<{ success: boolean; reservation: Reservation; staffTasks: StaffTask[] }>('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, ...payload }),
      });
      setReservations(prev => [data.reservation, ...prev]);
      setStaffTasks(data.staffTasks);
      return data.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const requestDrink = async (drinkId: string) => {
    try {
      const data = await api<{ success: boolean; drink: StoredDrink; staffTasks: StaffTask[] }>(`/api/drinks/${drinkId}/request`, {
        method: 'POST',
      });
      setStoredDrinks(prev => prev.map(drink => (drink.id === drinkId ? data.drink : drink)));
      setStaffTasks(data.staffTasks);
      return data.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const inviteFriend = async () => {
    if (!user) return false;
    try {
      const data = await api<{ success: boolean; user: User }>('/api/invite', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
      });
      setUser(data.user);
      return data.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const completeStaffTask = async (taskId: string) => {
    const data = await api<{ success: boolean; task: StaffTask; reservations: Reservation[]; drinks: StoredDrink[] }>(
      `/api/staff/tasks/${taskId}/complete`,
      { method: 'POST' },
    );
    setStaffTasks(prev => prev.map(task => (task.id === taskId ? data.task : task)));
    setReservations(data.reservations);
    setStoredDrinks(data.drinks);
    return data.success;
  };

  const value = useMemo<AppContextType>(
    () => ({
      user,
      products,
      storedDrinks,
      cart,
      tournaments,
      reservations,
      orders,
      leaderboard,
      staffTasks,
      loading,
      addToCart,
      removeFromCart,
      clearCart,
      checkout,
      registerTournament,
      checkin,
      recharge,
      createReservation,
      requestDrink,
      inviteFriend,
      completeStaffTask,
      refresh,
    }),
    [user, products, storedDrinks, cart, tournaments, reservations, orders, leaderboard, staffTasks, loading, refresh],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
