import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import cors from 'cors';

const PORT = Number(process.env.PORT || 3000);
const DB_FILE = path.join(process.cwd(), 'local-cloud-db.json');
const DEMO_USER_ID = 'u1';

type Status = 'pending' | 'done';

interface User {
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
  role: 'member' | 'staff' | 'admin';
}

interface Product {
  id: string;
  name: string;
  description: string;
  pricePoints: number;
  priceRMB: number;
  image: string;
  category: string;
  canStore: boolean;
}

interface DbData {
  users: User[];
  products: Product[];
  tournaments: any[];
  registeredTournaments: Array<{ userId: string; tournamentId: string }>;
  storedDrinks: any[];
  reservations: any[];
  orders: any[];
  staffTasks: any[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowText() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function seedData(): DbData {
  return {
    users: [
      { id: 'u1', openId: 'mock-openid-u1', name: '松山Aki', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aki', level: '黑金会员', points: 12880, balanceRMB: 860, rankScore: 9260, checkinStreak: 3, lastCheckinDate: null, role: 'admin' },
      { id: 'u2', openId: 'mock-openid-u2', name: 'River Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=River', level: '铂金会员', points: 8400, balanceRMB: 300, rankScore: 8740, checkinStreak: 7, lastCheckinDate: null, role: 'member' },
      { id: 'u3', openId: 'mock-openid-u3', name: 'All-in May', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=May', level: '黄金会员', points: 6200, balanceRMB: 180, rankScore: 8010, checkinStreak: 2, lastCheckinDate: null, role: 'member' },
      { id: 'u4', openId: 'mock-openid-u4', name: 'Button Leo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', level: '银卡会员', points: 4200, balanceRMB: 90, rankScore: 6760, checkinStreak: 1, lastCheckinDate: null, role: 'member' },
    ],
    products: [
      { id: 'p1', name: '百威金尊', description: '冰镇即饮，适合短局开桌', pricePoints: 300, priceRMB: 30, image: 'https://images.unsplash.com/photo-1614316053351-ab7d6f5fb846?q=80&w=400&auto=format&fit=crop', category: 'drink', canStore: false },
      { id: 'p2', name: '轩尼诗 VSOP', description: '700ml 干邑，可现场开瓶或存酒', pricePoints: 12000, priceRMB: 1288, image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=400&auto=format&fit=crop', category: 'bottle', canStore: true },
      { id: 'p3', name: '麦卡伦 12 年', description: '单一麦芽威士忌，可寄存 60 天', pricePoints: 16000, priceRMB: 1688, image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=400&auto=format&fit=crop', category: 'bottle', canStore: true },
      { id: 'p4', name: '至尊果盘', description: '应季鲜果，适合 4-6 人桌', pricePoints: 800, priceRMB: 88, image: 'https://images.unsplash.com/photo-1546039907-7fa05f864c02?q=80&w=400&auto=format&fit=crop', category: 'snack', canStore: false },
      { id: 'p5', name: '炸物小吃拼盘', description: '薯条、鸡块、洋葱圈', pricePoints: 600, priceRMB: 68, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=400&auto=format&fit=crop', category: 'snack', canStore: false },
      { id: 'p6', name: '实体会员卡', description: '到店领取，绑定后享积分倍率', pricePoints: 6800, priceRMB: 699, image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?q=80&w=400&auto=format&fit=crop', category: 'card', canStore: false },
    ],
    tournaments: [
      { id: 't1', name: '周五深筹积分赛', time: '今晚 20:00', buyInPoints: 2000, blind: '100/200', players: 24, maxPlayers: 45, status: 'registering', prize: '冠军 18000 积分' },
      { id: 't2', name: '新人免费体验赛', time: '今晚 21:30', buyInPoints: 0, blind: '50/100', players: 16, maxPlayers: 24, status: 'registering', prize: '前三名酒水券' },
      { id: 't3', name: '周末豪客桌', time: '明晚 19:30', buyInPoints: 10000, blind: '500/1000', players: 8, maxPlayers: 27, status: 'registering', prize: '奖池按人数浮动' },
    ],
    registeredTournaments: [],
    storedDrinks: [
      { id: 'sd1', userId: 'u1', name: '轩尼诗 VSOP', volumeLeft: '约 45%', storedDate: '2026-04-12', expiryDate: '2026-06-12', status: 'stored' },
      { id: 'sd2', userId: 'u1', name: '麦卡伦 12 年', volumeLeft: '未开封', storedDate: '2026-04-22', expiryDate: '2026-06-22', status: 'stored' },
    ],
    reservations: [
      { id: 'r1', userId: 'u1', tableType: '标准德州桌', guests: 6, timeSlot: '今晚 20:00', status: 'waiting', queueNo: 7, note: '靠近吧台', createdAt: '2026-04-30 18:10' },
    ],
    orders: [
      { id: 'o1', userId: 'u1', items: [{ name: '百威金尊', quantity: 2, priceRMB: 30, pricePoints: 300 }], totalRMB: 60, totalPoints: 600, paidBy: 'balance', status: 'served', createdAt: '2026-04-29 22:18' },
    ],
    staffTasks: [
      { id: 'task1', type: 'seat', title: '确认入座：松山Aki', subtitle: '标准德州桌 6 人，今晚 20:00', refId: 'r1', status: 'pending', createdAt: '2026-04-30 18:10' },
    ],
  };
}

async function loadDb(): Promise<DbData> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
  } catch {
    const data = seedData();
    await saveDb(data);
    return data;
  }
}

async function saveDb(data: DbData) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

function publicUser(data: DbData, userId: string) {
  const user = data.users.find(item => item.id === userId);
  if (!user) return null;
  return {
    ...user,
    registeredTournaments: data.registeredTournaments.filter(item => item.userId === userId).map(item => item.tournamentId),
  };
}

function sortedStaffTasks(data: DbData) {
  return [...data.staffTasks].sort((a, b) => (a.status === b.status ? b.createdAt.localeCompare(a.createdAt) : a.status === 'pending' ? -1 : 1));
}

async function mutate(mutator: (data: DbData) => void | unknown) {
  const data = await loadDb();
  const result = mutator(data);
  await saveDb(data);
  return { data, result };
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.post('/api/auth/wechat-login', async (req, res) => {
    if (!req.body.code) return res.status(400).json({ error: 'Missing login code' });
    const data = await loadDb();
    res.json({ token: `local-token-${DEMO_USER_ID}`, user: publicUser(data, DEMO_USER_ID) });
  });

  app.get('/api/products', async (_req, res) => res.json((await loadDb()).products));
  app.get('/api/tournaments', async (_req, res) => res.json((await loadDb()).tournaments));
  app.get('/api/users/:id/drinks', async (req, res) => res.json((await loadDb()).storedDrinks.filter(item => item.userId === req.params.id)));
  app.get('/api/users/:id/reservations', async (req, res) => res.json((await loadDb()).reservations.filter(item => item.userId === req.params.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
  app.get('/api/users/:id/orders', async (req, res) => res.json((await loadDb()).orders.filter(item => item.userId === req.params.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
  app.get('/api/leaderboard', async (_req, res) => res.json((await loadDb()).users.map(({ id, name, avatar, level, rankScore }) => ({ id, name, avatar, level, rankScore })).sort((a, b) => b.rankScore - a.rankScore)));
  app.get('/api/staff/tasks', async (_req, res) => res.json(sortedStaffTasks(await loadDb())));

  app.post('/api/checkin', async (req, res) => {
    const { data } = await mutate(data => {
      const user = data.users.find(item => item.id === req.body.userId);
      if (!user) throw new Error('User not found');
      if (user.lastCheckinDate === today()) throw new Error('Already checked in today');
      const points = 120 + Math.min(user.checkinStreak, 7) * 20;
      user.points += points;
      user.rankScore += points;
      user.checkinStreak += 1;
      user.lastCheckinDate = today();
    }).catch(err => ({ data: null as any, result: err }));
    if (!data) return res.status(400).json({ error: 'Already checked in today' });
    res.json({ success: true, user: publicUser(data, req.body.userId) });
  });

  app.post('/api/recharge', async (req, res) => {
    const amount = Number(req.body.amount);
    if (![200, 500, 1000, 2000].includes(amount)) return res.status(400).json({ error: 'Invalid amount' });
    const { data, result: order } = await mutate(data => {
      const user = data.users.find(item => item.id === req.body.userId);
      if (!user) throw new Error('User not found');
      const bonus = Math.floor(amount * 0.12);
      user.balanceRMB += amount;
      user.points += bonus;
      user.rankScore += bonus;
      const order = { id: id('o'), userId: user.id, items: [{ name: `充值 ${amount} 元`, quantity: 1, priceRMB: amount, pricePoints: bonus }], totalRMB: amount, totalPoints: bonus, paidBy: 'balance', status: 'paid', createdAt: nowText() };
      data.orders.unshift(order);
      return order;
    });
    res.json({ success: true, user: publicUser(data, req.body.userId), order });
  });

  app.post('/api/checkout', async (req, res) => {
    try {
      const { data, result: order } = await mutate(data => {
        const user = data.users.find(item => item.id === req.body.userId);
        if (!user) throw new Error('User not found');
        const orderItems = req.body.items.map((item: any) => {
          const product = data.products.find(product => product.id === item.productId);
          if (!product) throw new Error('Invalid product');
          return { name: product.name, quantity: Number(item.quantity), priceRMB: product.priceRMB, pricePoints: product.pricePoints };
        });
        const totalRMB = orderItems.reduce((sum: number, item: any) => sum + item.priceRMB * item.quantity, 0);
        const totalPoints = orderItems.reduce((sum: number, item: any) => sum + item.pricePoints * item.quantity, 0);
        if (req.body.paidBy === 'points') {
          if (user.points < totalPoints) throw new Error('Insufficient points');
          user.points -= totalPoints;
          user.rankScore += Math.floor(totalPoints * 0.05);
        } else {
          if (user.balanceRMB < totalRMB) throw new Error('Insufficient balance');
          user.balanceRMB -= totalRMB;
          user.points += Math.floor(totalRMB * 1.5);
          user.rankScore += Math.floor(totalRMB * 1.5);
        }
        const order = { id: id('o'), userId: user.id, items: orderItems, totalRMB, totalPoints, paidBy: req.body.paidBy, status: 'paid', createdAt: nowText() };
        data.orders.unshift(order);
        data.staffTasks.unshift({ id: id('task'), type: 'order', title: `出品订单：${user.name}`, subtitle: orderItems.map((item: any) => `${item.name}x${item.quantity}`).join('、'), refId: order.id, status: 'pending', createdAt: order.createdAt });
        return order;
      });
      res.json({ success: true, user: publicUser(data, req.body.userId), order, staffTasks: sortedStaffTasks(data) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/tournaments/register', async (req, res) => {
    try {
      const { data, result: tournament } = await mutate(data => {
        const user = data.users.find(item => item.id === req.body.userId);
        const tournament = data.tournaments.find(item => item.id === req.body.tournamentId);
        if (!user || !tournament) throw new Error('Not found');
        if (data.registeredTournaments.some(item => item.userId === user.id && item.tournamentId === tournament.id)) throw new Error('Already registered');
        if (tournament.players >= tournament.maxPlayers) throw new Error('Tournament is full');
        if (user.points < tournament.buyInPoints) throw new Error('Insufficient points');
        user.points -= tournament.buyInPoints;
        user.rankScore += Math.floor(tournament.buyInPoints * 0.2);
        tournament.players += 1;
        data.registeredTournaments.push({ userId: user.id, tournamentId: tournament.id });
        return tournament;
      });
      res.json({ success: true, user: publicUser(data, req.body.userId), tournament });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/reservations', async (req, res) => {
    const { data, result: reservation } = await mutate(data => {
      const user = data.users.find(item => item.id === req.body.userId)!;
      const queueNo = Math.max(0, ...data.reservations.filter(item => item.status === 'waiting').map(item => item.queueNo)) + 1;
      const reservation = { id: id('r'), userId: user.id, tableType: req.body.tableType, guests: Number(req.body.guests), timeSlot: req.body.timeSlot, status: 'waiting', queueNo, note: req.body.note || '', createdAt: nowText() };
      data.reservations.unshift(reservation);
      data.staffTasks.unshift({ id: id('task'), type: 'seat', title: `确认入座：${user.name}`, subtitle: `${reservation.tableType} ${reservation.guests} 人，${reservation.timeSlot}`, refId: reservation.id, status: 'pending', createdAt: reservation.createdAt });
      return reservation;
    });
    res.json({ success: true, reservation, staffTasks: sortedStaffTasks(data) });
  });

  app.post('/api/drinks/:id/request', async (req, res) => {
    const { data, result: drink } = await mutate(data => {
      const drink = data.storedDrinks.find(item => item.id === req.params.id);
      if (!drink) throw new Error('Drink not found');
      const user = data.users.find(item => item.id === drink.userId)!;
      drink.status = 'requested';
      data.staffTasks.unshift({ id: id('task'), type: 'drink', title: `提酒：${user.name}`, subtitle: `${drink.name}，剩余 ${drink.volumeLeft}`, refId: drink.id, status: 'pending', createdAt: nowText() });
      return drink;
    });
    res.json({ success: true, drink, staffTasks: sortedStaffTasks(data) });
  });

  app.post('/api/invite', async (req, res) => {
    const { data } = await mutate(data => {
      const user = data.users.find(item => item.id === req.body.userId)!;
      user.points += 188;
      user.rankScore += 188;
    });
    res.json({ success: true, user: publicUser(data, req.body.userId) });
  });

  app.post('/api/staff/tasks/:id/complete', async (req, res) => {
    const { data, result: task } = await mutate(data => {
      const task = data.staffTasks.find(item => item.id === req.params.id);
      if (!task) throw new Error('Task not found');
      task.status = 'done' as Status;
      if (task.type === 'seat') data.reservations.find(item => item.id === task.refId)!.status = 'seated';
      if (task.type === 'drink') data.storedDrinks.find(item => item.id === task.refId)!.status = 'picked';
      if (task.type === 'order') data.orders.find(item => item.id === task.refId)!.status = 'served';
      return task;
    });
    res.json({ success: true, task, reservations: data.reservations.filter(item => item.userId === DEMO_USER_ID), drinks: data.storedDrinks.filter(item => item.userId === DEMO_USER_ID) });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
