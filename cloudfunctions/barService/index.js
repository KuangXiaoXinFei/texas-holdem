const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const collections = {
  users: db.collection('users'),
  products: db.collection('products'),
  tournaments: db.collection('tournaments'),
  registeredTournaments: db.collection('registeredTournaments'),
  storedDrinks: db.collection('storedDrinks'),
  reservations: db.collection('reservations'),
  orders: db.collection('orders'),
  staffTasks: db.collection('staffTasks')
};

function nowText() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function publicUser(user, registrations) {
  if (!user) return null;
  return {
    ...user,
    registeredTournaments: registrations.map(item => item.tournamentId)
  };
}

async function getUserByOpenId(openId) {
  const result = await collections.users.where({ openId }).limit(1).get();
  return result.data[0];
}

async function getPublicUser(userId) {
  const userResult = await collections.users.doc(userId).get();
  const regResult = await collections.registeredTournaments.where({ userId }).get();
  return publicUser(userResult.data, regResult.data);
}

async function ensureSeed(openId) {
  const existing = await getUserByOpenId(openId);
  if (existing) return existing;

  const userId = `u_${Date.now()}`;
  const user = {
    _id: userId,
    openId,
    name: '微信玩家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wx',
    level: '黑金会员',
    points: 12880,
    balanceRMB: 860,
    rankScore: 9260,
    checkinStreak: 0,
    lastCheckinDate: null,
    role: 'admin',
    createdAt: nowText()
  };
  await collections.users.add({ data: user });

  const productCount = await collections.products.count();
  if (productCount.total === 0) {
    await Promise.all([
      collections.products.add({ data: { name: '百威金尊', description: '冰镇即饮，适合短局开桌', pricePoints: 300, priceRMB: 30, image: 'https://images.unsplash.com/photo-1614316053351-ab7d6f5fb846?q=80&w=400&auto=format&fit=crop', category: 'drink', canStore: false } }),
      collections.products.add({ data: { name: '轩尼诗 VSOP', description: '700ml 干邑，可现场开瓶或存酒', pricePoints: 12000, priceRMB: 1288, image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=400&auto=format&fit=crop', category: 'bottle', canStore: true } }),
      collections.products.add({ data: { name: '麦卡伦 12 年', description: '单一麦芽威士忌，可寄存 60 天', pricePoints: 16000, priceRMB: 1688, image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=400&auto=format&fit=crop', category: 'bottle', canStore: true } }),
      collections.products.add({ data: { name: '至尊果盘', description: '应季鲜果，适合 4-6 人桌', pricePoints: 800, priceRMB: 88, image: 'https://images.unsplash.com/photo-1546039907-7fa05f864c02?q=80&w=400&auto=format&fit=crop', category: 'snack', canStore: false } }),
      collections.products.add({ data: { name: '实体会员卡', description: '到店领取，绑定后享积分倍率', pricePoints: 6800, priceRMB: 699, image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?q=80&w=400&auto=format&fit=crop', category: 'card', canStore: false } })
    ]);
  }

  const tournamentCount = await collections.tournaments.count();
  if (tournamentCount.total === 0) {
    await Promise.all([
      collections.tournaments.add({ data: { name: '周五深筹积分赛', time: '今晚 20:00', buyInPoints: 2000, blind: '100/200', players: 24, maxPlayers: 45, status: 'registering', prize: '冠军 18000 积分' } }),
      collections.tournaments.add({ data: { name: '新人免费体验赛', time: '今晚 21:30', buyInPoints: 0, blind: '50/100', players: 16, maxPlayers: 24, status: 'registering', prize: '前三名酒水券' } })
    ]);
  }

  await collections.storedDrinks.add({ data: { userId, name: '轩尼诗 VSOP', volumeLeft: '约 45%', storedDate: today(), expiryDate: '2026-06-12', status: 'stored' } });
  return user;
}

async function login(openId) {
  const user = await ensureSeed(openId);
  return { user: await getPublicUser(user._id) };
}

async function bootstrap(openId) {
  const user = await ensureSeed(openId);
  const userId = user._id;
  const [products, tournaments, drinks, reservations, orders, leaderboard, tasks] = await Promise.all([
    collections.products.limit(50).get(),
    collections.tournaments.limit(50).get(),
    collections.storedDrinks.where({ userId }).orderBy('storedDate', 'desc').get(),
    collections.reservations.where({ userId }).orderBy('createdAt', 'desc').get(),
    collections.orders.where({ userId }).orderBy('createdAt', 'desc').get(),
    collections.users.orderBy('rankScore', 'desc').limit(20).get(),
    collections.staffTasks.orderBy('createdAt', 'desc').limit(100).get()
  ]);

  return {
    user: await getPublicUser(userId),
    products: products.data,
    tournaments: tournaments.data,
    storedDrinks: drinks.data,
    reservations: reservations.data,
    orders: orders.data,
    leaderboard: leaderboard.data,
    staffTasks: tasks.data
  };
}

async function checkin(userId) {
  const user = await collections.users.doc(userId).get();
  if (user.data.lastCheckinDate === today()) throw new Error('ALREADY_CHECKED_IN');
  const reward = 120 + Math.min(user.data.checkinStreak || 0, 7) * 20;
  await collections.users.doc(userId).update({
    data: {
      points: _.inc(reward),
      rankScore: _.inc(reward),
      checkinStreak: _.inc(1),
      lastCheckinDate: today()
    }
  });
  return { user: await getPublicUser(userId), reward };
}

async function recharge(userId, amount) {
  if (![200, 500, 1000, 2000].includes(amount)) throw new Error('INVALID_AMOUNT');
  const bonus = Math.floor(amount * 0.12);
  await collections.users.doc(userId).update({
    data: {
      balanceRMB: _.inc(amount),
      points: _.inc(bonus),
      rankScore: _.inc(bonus)
    }
  });
  const order = {
    userId,
    items: [{ name: `充值 ${amount} 元`, quantity: 1, priceRMB: amount, pricePoints: bonus }],
    totalRMB: amount,
    totalPoints: bonus,
    paidBy: 'balance',
    status: 'paid',
    createdAt: nowText()
  };
  const addResult = await collections.orders.add({ data: order });
  return { user: await getPublicUser(userId), order: { ...order, _id: addResult._id } };
}

async function checkout(userId, items, paidBy) {
  const user = (await collections.users.doc(userId).get()).data;
  const products = await Promise.all(items.map(item => collections.products.doc(item.productId).get()));
  const orderItems = products.map((productResult, index) => ({
    name: productResult.data.name,
    quantity: Number(items[index].quantity),
    priceRMB: productResult.data.priceRMB,
    pricePoints: productResult.data.pricePoints
  }));
  const totalRMB = orderItems.reduce((sum, item) => sum + item.priceRMB * item.quantity, 0);
  const totalPoints = orderItems.reduce((sum, item) => sum + item.pricePoints * item.quantity, 0);
  if (paidBy === 'points' && user.points < totalPoints) throw new Error('INSUFFICIENT_POINTS');
  if (paidBy === 'balance' && user.balanceRMB < totalRMB) throw new Error('INSUFFICIENT_BALANCE');

  await collections.users.doc(userId).update({
    data: paidBy === 'points'
      ? { points: _.inc(-totalPoints), rankScore: _.inc(Math.floor(totalPoints * 0.05)) }
      : { balanceRMB: _.inc(-totalRMB), points: _.inc(Math.floor(totalRMB * 1.5)), rankScore: _.inc(Math.floor(totalRMB * 1.5)) }
  });

  const order = { userId, items: orderItems, totalRMB, totalPoints, paidBy, status: 'paid', createdAt: nowText() };
  const orderResult = await collections.orders.add({ data: order });
  await collections.staffTasks.add({
    data: {
      type: 'order',
      title: `出品订单：${user.name}`,
      subtitle: orderItems.map(item => `${item.name}x${item.quantity}`).join('、'),
      refId: orderResult._id,
      status: 'pending',
      createdAt: nowText()
    }
  });
  return { user: await getPublicUser(userId), order: { ...order, _id: orderResult._id } };
}

async function createReservation(userId, payload) {
  const user = (await collections.users.doc(userId).get()).data;
  const reservation = {
    userId,
    tableType: payload.tableType,
    guests: Number(payload.guests),
    timeSlot: payload.timeSlot,
    status: 'waiting',
    queueNo: Date.now() % 1000,
    note: payload.note || '',
    createdAt: nowText()
  };
  const result = await collections.reservations.add({ data: reservation });
  await collections.staffTasks.add({
    data: {
      type: 'seat',
      title: `确认入座：${user.name}`,
      subtitle: `${reservation.tableType} ${reservation.guests} 人，${reservation.timeSlot}`,
      refId: result._id,
      status: 'pending',
      createdAt: reservation.createdAt
    }
  });
  return { reservation: { ...reservation, _id: result._id } };
}

async function requestDrink(drinkId) {
  const drink = (await collections.storedDrinks.doc(drinkId).get()).data;
  const user = (await collections.users.doc(drink.userId).get()).data;
  await collections.storedDrinks.doc(drinkId).update({ data: { status: 'requested' } });
  await collections.staffTasks.add({
    data: {
      type: 'drink',
      title: `提酒：${user.name}`,
      subtitle: `${drink.name}，剩余 ${drink.volumeLeft}`,
      refId: drinkId,
      status: 'pending',
      createdAt: nowText()
    }
  });
  return { drink: { ...drink, _id: drinkId, status: 'requested' } };
}

async function registerTournament(userId, tournamentId) {
  const user = (await collections.users.doc(userId).get()).data;
  const tournament = (await collections.tournaments.doc(tournamentId).get()).data;
  const existing = await collections.registeredTournaments.where({ userId, tournamentId }).limit(1).get();
  if (existing.data.length) throw new Error('ALREADY_REGISTERED');
  if (tournament.players >= tournament.maxPlayers) throw new Error('TOURNAMENT_FULL');
  if (user.points < tournament.buyInPoints) throw new Error('INSUFFICIENT_POINTS');
  await collections.users.doc(userId).update({ data: { points: _.inc(-tournament.buyInPoints), rankScore: _.inc(Math.floor(tournament.buyInPoints * 0.2)) } });
  await collections.tournaments.doc(tournamentId).update({ data: { players: _.inc(1) } });
  await collections.registeredTournaments.add({ data: { userId, tournamentId, createdAt: nowText() } });
  return { user: await getPublicUser(userId), tournament: { ...tournament, _id: tournamentId, players: tournament.players + 1 } };
}

async function invite(userId) {
  await collections.users.doc(userId).update({ data: { points: _.inc(188), rankScore: _.inc(188) } });
  return { user: await getPublicUser(userId) };
}

async function completeStaffTask(taskId) {
  const task = (await collections.staffTasks.doc(taskId).get()).data;
  await collections.staffTasks.doc(taskId).update({ data: { status: 'done' } });
  if (task.type === 'seat') await collections.reservations.doc(task.refId).update({ data: { status: 'seated' } });
  if (task.type === 'drink') await collections.storedDrinks.doc(task.refId).update({ data: { status: 'picked' } });
  if (task.type === 'order') await collections.orders.doc(task.refId).update({ data: { status: 'served' } });
  return { task: { ...task, _id: taskId, status: 'done' } };
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const { action, payload = {} } = event;

  try {
    if (action === 'login') return { success: true, data: await login(wxContext.OPENID) };
    if (action === 'bootstrap') return { success: true, data: await bootstrap(wxContext.OPENID) };
    if (action === 'checkin') return { success: true, data: await checkin(payload.userId) };
    if (action === 'recharge') return { success: true, data: await recharge(payload.userId, Number(payload.amount)) };
    if (action === 'checkout') return { success: true, data: await checkout(payload.userId, payload.items, payload.paidBy) };
    if (action === 'createReservation') return { success: true, data: await createReservation(payload.userId, payload) };
    if (action === 'requestDrink') return { success: true, data: await requestDrink(payload.drinkId) };
    if (action === 'registerTournament') return { success: true, data: await registerTournament(payload.userId, payload.tournamentId) };
    if (action === 'invite') return { success: true, data: await invite(payload.userId) };
    if (action === 'completeStaffTask') return { success: true, data: await completeStaffTask(payload.taskId) };
    throw new Error('UNKNOWN_ACTION');
  } catch (err) {
    return { success: false, error: err.message };
  }
};
