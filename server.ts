import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";

const PORT = 3000;

async function setupDatabase() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      avatar TEXT,
      level TEXT,
      points INTEGER,
      balanceRMB INTEGER
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      pricePoints INTEGER,
      priceRMB INTEGER,
      image TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT,
      time TEXT,
      buyInPoints INTEGER,
      blind TEXT,
      players INTEGER,
      maxPlayers INTEGER,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS registered_tournaments (
      userId TEXT,
      tournamentId TEXT,
      PRIMARY KEY (userId, tournamentId)
    );

    CREATE TABLE IF NOT EXISTS stored_drinks (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      volumeLeft TEXT,
      storedDate TEXT,
      expiryDate TEXT
    );
  `);

  // Initialize Data if empty
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    await db.run(`INSERT INTO users (id, name, avatar, level, points, balanceRMB) VALUES 
      ('u1', '德州之王', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', '黑金会员', 12500, 500)`);
    
    const statements = [
      `INSERT INTO products VALUES ('p1', '百威金尊 (支)', '清爽口感', 300, 30, 'https://images.unsplash.com/photo-1614316053351-ab7d6f5fb846?q=80&w=200&auto=format&fit=crop', 'drink')`,
      `INSERT INTO products VALUES ('p2', '轩尼诗 VSOP', '700ml 经典干邑', 12000, 1288, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=200&auto=format&fit=crop', 'bottle')`,
      `INSERT INTO products VALUES ('p3', '至尊果盘', '应季鲜果拼盘', 800, 88, 'https://images.unsplash.com/photo-1546039907-7fa05f864c02?q=80&w=200&auto=format&fit=crop', 'snack')`,
      `INSERT INTO products VALUES ('p4', '炸物小吃拼盘', '薯条、鸡块、洋葱圈', 600, 68, 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=200&auto=format&fit=crop', 'snack')`,
      `INSERT INTO products VALUES ('p5', '巴黎水', '气泡水', 200, 25, 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=200&auto=format&fit=crop', 'drink')`,
      
      `INSERT INTO tournaments VALUES ('t1', '周五回馈深筹赛', '今日 20:00', 2000, '100/200', 24, 45, 'registering')`,
      `INSERT INTO tournaments VALUES ('t2', '新手练习赛 (Freeroll)', '今日 14:00', 0, '50/100', 18, 18, 'ongoing')`,
      `INSERT INTO tournaments VALUES ('t3', '周末豪客赛', '明日 19:30', 10000, '500/1000', 8, 27, 'registering')`,
      
      `INSERT INTO stored_drinks VALUES ('sd1', 'u1', '轩尼诗 VSOP', '约 40%', '2023-10-15', '2023-11-15')`
    ];

    for (const stmt of statements) {
      await db.run(stmt);
    }
  }

  return db;
}

async function startServer() {
  const db = await setupDatabase();
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // Get User
  app.get('/api/users/:id', async (req, res) => {
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const registered = await db.all('SELECT tournamentId FROM registered_tournaments WHERE userId = ?', req.params.id);
    user.registeredTournaments = registered.map((r: any) => r.tournamentId);
    
    res.json(user);
  });

  // Get Products
  app.get('/api/products', async (req, res) => {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  });

  // Get Tournaments
  app.get('/api/tournaments', async (req, res) => {
    const tournaments = await db.all('SELECT * FROM tournaments');
    res.json(tournaments);
  });

  // Get Stored Drinks
  app.get('/api/users/:id/drinks', async (req, res) => {
    const drinks = await db.all('SELECT * FROM stored_drinks WHERE userId = ?', req.params.id);
    res.json(drinks);
  });

  // Checkout Cart
  app.post('/api/checkout', async (req, res) => {
    const { userId, totalPoints, totalRMB, usePoints } = req.body;
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (usePoints) {
      if (user.points < totalPoints) return res.status(400).json({ error: 'Insufficient points' });
      await db.run('UPDATE users SET points = points - ? WHERE id = ?', totalPoints, userId);
    } else {
      if (user.balanceRMB < totalRMB) return res.status(400).json({ error: 'Insufficient balance' });
      await db.run('UPDATE users SET balanceRMB = balanceRMB - ? WHERE id = ?', totalRMB, userId);
    }

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', userId);
    const registered = await db.all('SELECT tournamentId FROM registered_tournaments WHERE userId = ?', userId);
    updatedUser.registeredTournaments = registered.map((r: any) => r.tournamentId);

    res.json({ success: true, user: updatedUser });
  });

  // Register Tournament
  app.post('/api/tournaments/register', async (req, res) => {
    const { userId, tournamentId } = req.body;
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
    const tournament = await db.get('SELECT * FROM tournaments WHERE id = ?', tournamentId);
    
    if (!user || !tournament) return res.status(404).json({ error: 'Not found' });

    const existing = await db.get('SELECT * FROM registered_tournaments WHERE userId = ? AND tournamentId = ?', userId, tournamentId);
    if (existing) return res.status(400).json({ error: 'Already registered' });
    
    if (tournament.players >= tournament.maxPlayers) return res.status(400).json({ error: 'Tournament is full' });
    if (user.points < tournament.buyInPoints) return res.status(400).json({ error: 'Insufficient points' });

    // Transaction
    await db.run('BEGIN TRANSACTION');
    try {
      await db.run('UPDATE users SET points = points - ? WHERE id = ?', tournament.buyInPoints, userId);
      await db.run('UPDATE tournaments SET players = players + 1 WHERE id = ?', tournamentId);
      await db.run('INSERT INTO registered_tournaments (userId, tournamentId) VALUES (?, ?)', userId, tournamentId);
      await db.run('COMMIT');
    } catch (err) {
      await db.run('ROLLBACK');
      return res.status(500).json({ error: 'Transaction failed' });
    }

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', userId);
    const registered = await db.all('SELECT tournamentId FROM registered_tournaments WHERE userId = ?', userId);
    updatedUser.registeredTournaments = registered.map((r: any) => r.tournamentId);

    const updatedTournament = await db.get('SELECT * FROM tournaments WHERE id = ?', tournamentId);

    res.json({ success: true, user: updatedUser, tournament: updatedTournament });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
