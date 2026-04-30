# RIVER ACE 德州酒吧小程序

仓库现在包含两套入口：

- `miniprogram/` + `cloudfunctions/`：微信小程序云开发版，部署到腾讯云云开发后运行。
- `src/` + `server.ts`：浏览器本地预览版，方便不打开微信开发者工具时快速调 UI 和流程。

## 微信小程序云开发运行

1. 用微信开发者工具导入本目录。
2. 在 `project.config.json` 里把 `appid` 改成你的真实小程序 AppID。
3. 在微信开发者工具里开通云开发环境。
4. 把 [miniprogram/app.js](/Users/liujishuai/git-project-7fresh/texas-holdem/miniprogram/app.js:1) 的 `replace-with-your-cloud-env-id` 改成你的云环境 ID。
5. 右键 `cloudfunctions/barService`，选择“上传并部署：云端安装依赖”。
6. 打开小程序首页，首次调用 `bootstrap` 会自动初始化基础用户、商品、赛事、存酒数据。

前端调用方式统一为：

```js
wx.cloud.callFunction({
  name: 'barService',
  data: {
    action: 'checkout',
    payload: { userId, items, paidBy: 'balance' }
  }
});
```

## 云数据库集合

云函数会使用这些集合：

- `users`
- `products`
- `tournaments`
- `registeredTournaments`
- `storedDrinks`
- `reservations`
- `orders`
- `staffTasks`

建议集合权限先使用“仅创建者及管理员可读写”，员工端上线前再按角色拆分权限；当前关键写操作都走云函数。

## 已实现云函数 action

- `login`
- `bootstrap`
- `checkin`
- `recharge`
- `checkout`
- `createReservation`
- `requestDrink`
- `registerTournament`
- `invite`
- `completeStaffTask`

## 浏览器本地预览

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。
