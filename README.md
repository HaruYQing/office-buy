# Office Buy

辦公室內部團購系統，協助團購發起人建立活動、管理訂單、統整資訊，同時方便參加者瀏覽、選購及查詢訂單。

---

## 技術棧

**後端 (office-buy-api)**
- Node.js v22
- Express v4
- TypeScript
- Prisma v5
- PostgreSQL 15
- express-session + bcrypt

**前端 (office-buy-client)**
- React v18
- TypeScript
- Vite
- Material UI

---

## 環境需求

- Node.js v22+
- npm
- Docker Desktop

---

## 專案結構

```
office-buy/
  office-buy-api/       ← 後端
  office-buy-client/    ← 前端
  API_DOC.md            ← API 文件
  TODO.md               ← 待辦事項
  README.md
```

---

## 環境設定

### 後端

在 `office-buy-api/` 複製 `.env.example` 並建立 `.env`：

```bash
cp .env.example .env
```

填入以下變數：

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>"
SESSION_SECRET="<your-secret-string>"
```

| 變數 | 說明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 連線字串，需與 `docker-compose.yml` 的設定一致 |
| `SESSION_SECRET` | Session 加密金鑰，請使用隨機強字串 |

### 前端

在 `office-buy-client/` 複製 `.env.example` 並建立 `.env`：

```bash
cp .env.example .env
```

> 前端環境變數待補充。

---

## 啟動步驟

### 1. 啟動資料庫

在 `office-buy-api/` 執行：

```bash
docker compose up -d
```

確認 PostgreSQL 容器正常運行後繼續。

### 2. 執行 Migration

在 `office-buy-api/` 執行：

```bash
npx prisma migrate deploy
```

### 3. 啟動後端

在 `office-buy-api/` 執行：

```bash
npm run dev
```

後端預設運行於 `http://localhost:3000`。

### 4. 啟動前端

在 `office-buy-client/` 執行：

```bash
npm install
npm run dev
```

前端預設運行於 `http://localhost:5173`。

---

## 開發文件

- API 文件：[API_DOC.md](./API_DOC.md)
- 待辦事項：[TODO.md](./TODO.md)

---

## 部署

待補充。
