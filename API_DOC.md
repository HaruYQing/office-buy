# Office Buy API Documentation

## 專案概述

辦公室內部團購系統後端 API，使用 Node.js + Express + TypeScript + Prisma + PostgreSQL 開發。

## 技術棧

- **Runtime**: Node.js
- **Framework**: Express v4
- **Language**: TypeScript
- **ORM**: Prisma v5
- **Database**: PostgreSQL 15
- **Auth**: express-session + bcrypt
- **開發工具**: ts-node, nodemon

## 專案結構

```
office-buy-api/
  prisma/
    schema.prisma
    migrations/
  src/
    controllers/
    services/
    routes/
    middlewares/
    lib/
      prisma.ts
    types/
      session.d.ts
    index.ts
  docker-compose.yml
  .env
  tsconfig.json
```

## 資料庫 Schema

### User

| 欄位        | 型別     | 說明              |
| ----------- | -------- | ----------------- |
| id          | Int      | PK, autoincrement |
| email       | String   | unique            |
| password    | String   | bcrypt hash       |
| displayName | String   | 顯示名稱          |
| isAdmin     | Boolean  | 預設 false        |
| createdAt   | DateTime | 建立時間          |

### Event

| 欄位          | 型別        | 說明                      |
| ------------- | ----------- | ------------------------- |
| id            | Int         | PK, autoincrement         |
| organizerId   | Int         | FK → User                 |
| title         | String      | 活動名稱                  |
| description   | String?     | 活動說明                  |
| status        | EventStatus | OPEN / CLOSED / CANCELLED |
| orderDeadline | DateTime    | 截止時間                  |
| pickupTime    | DateTime?   | 取貨時間                  |
| paymentInfo   | String?     | 付款說明                  |
| createdAt     | DateTime    | 建立時間                  |
| updatedAt     | DateTime    | 更新時間                  |

### Product

| 欄位        | 型別    | 說明                                  |
| ----------- | ------- | ------------------------------------- |
| id          | Int     | PK, autoincrement                     |
| eventId     | Int     | FK → Event                            |
| name        | String  | 商品名稱                              |
| price       | Int     | 價格（單位：分）                      |
| description | String? | 商品說明                              |
| isAvailable | Boolean | 預設 true，活動開始後只能下架不能刪除 |

### Order

| 欄位          | 型別          | 說明                |
| ------------- | ------------- | ------------------- |
| id            | Int           | PK, autoincrement   |
| eventId       | Int           | FK → Event          |
| participantId | Int           | FK → User           |
| paymentStatus | PaymentStatus | UNPAID / PAID       |
| pickupStatus  | PickupStatus  | PENDING / PICKED_UP |
| note          | String?       | 備註                |
| createdAt     | DateTime      | 建立時間            |
| updatedAt     | DateTime      | 更新時間            |

### OrderItem

| 欄位          | 型別 | 說明                                             |
| ------------- | ---- | ------------------------------------------------ |
| id            | Int  | PK, autoincrement                                |
| orderId       | Int  | FK → Order                                       |
| productId     | Int  | FK → Product                                     |
| quantity      | Int  | 數量                                             |
| priceSnapshot | Int  | 下單當下的價格（單位：分），避免改價影響歷史紀錄 |

### Template

| 欄位        | 型別     | 說明                        |
| ----------- | -------- | --------------------------- |
| id          | Int      | PK, autoincrement           |
| createdById | Int      | FK → User，供管理員介面參考 |
| vendorName  | String   | 商家名稱                    |
| description | String?  | 說明                        |
| createdAt   | DateTime | 建立時間                    |
| updatedAt   | DateTime | 更新時間                    |

### TemplateItem

| 欄位        | 型別    | 說明              |
| ----------- | ------- | ----------------- |
| id          | Int     | PK, autoincrement |
| templateId  | Int     | FK → Template     |
| name        | String  | 品項名稱          |
| price       | Int     | 價格（單位：分）  |
| description | String? | 說明              |

---

## 權限規則

| 操作              | 一般使用者  | 發起人            | 管理員 |
| ----------------- | ----------- | ----------------- | ------ |
| 瀏覽活動          | ✓           | ✓                 | ✓      |
| 建立活動          | ✓           | ✓                 | ✓      |
| 編輯自己的活動    | ✗           | ✓                 | ✓      |
| 刪除自己的活動    | ✗           | ✓                 | ✓      |
| 刪除任何活動      | ✗           | ✗                 | ✓      |
| 新增/編輯商品     | ✗           | ✓（活動 OPEN 時） | ✓      |
| 下架商品          | ✗           | ✓                 | ✓      |
| 建立/編輯訂單     | ✓（自己的） | ✓（自己的）       | ✓      |
| 查看活動所有訂單  | ✗           | ✓（自己的活動）   | ✓      |
| 更新付款/取貨狀態 | ✗           | ✓（自己的活動）   | ✓      |
| 匯出訂單 CSV      | ✗           | ✓（自己的活動）   | ✓      |
| 建立/編輯範本     | ✓           | ✓                 | ✓      |
| 刪除範本          | ✗           | ✗                 | ✓      |

---

## 商品操作規則

- 活動建立後即視為「開始」
- 活動 `OPEN` 狀態：可新增、編輯、下架商品
- 活動 `CLOSED` / `CANCELLED`：商品不能異動
- 商品一律不能刪除（只能下架），範本品項可以刪除

---

## API Endpoints

### Auth

#### POST /api/auth/register

註冊新帳號，成功後自動登入。

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "王小明"
}
```

**Response 201**

```json
{
  "id": 1,
  "email": "user@example.com",
  "displayName": "王小明"
}
```

**Errors**

- `400` Missing required fields
- `409` Email already taken

---

#### POST /api/auth/login

登入，建立 session。

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200**

```json
{
  "id": 1,
  "email": "user@example.com",
  "displayName": "王小明",
  "isAdmin": false
}
```

**Errors**

- `400` Missing required fields
- `401` Invalid email or password

---

#### POST /api/auth/logout

登出，銷毀 session。需登入。

**Response 200**

```json
{
  "message": "Logged out"
}
```

---

#### GET /api/auth/me

取得目前登入的使用者資訊。需登入。

**Response 200**

```json
{
  "id": 1,
  "email": "user@example.com",
  "displayName": "王小明",
  "isAdmin": false
}
```

---

### Events

#### GET /api/events

取得所有 OPEN 狀態的活動列表，不需登入。

**Response 200**

```json
[
  {
    "id": 1,
    "title": "野人舒食團購",
    "description": "本週團購",
    "status": "OPEN",
    "orderDeadline": "2026-04-10T12:00:00.000Z",
    "pickupTime": "2026-04-11T12:00:00.000Z",
    "paymentInfo": "請匯款至 XX 銀行",
    "organizer": { "id": 1, "displayName": "王小明" },
    "_count": { "orders": 3 }
  }
]
```

---

#### POST /api/events

建立活動，可同時建立商品。需登入。

**Request Body**

```json
{
  "title": "野人舒食團購",
  "description": "本週團購",
  "orderDeadline": "2026-04-10T12:00:00.000Z",
  "pickupTime": "2026-04-11T12:00:00.000Z",
  "paymentInfo": "請匯款至 XX 銀行",
  "products": [
    { "name": "雞胸肉-原味", "price": 8000 },
    { "name": "雞胸肉-黑胡椒", "price": 8000 }
  ]
}
```

> `price` 單位為分，8000 = $80

**Response 201** 回傳建立的活動含商品列表。

**Errors**

- `400` Missing required fields

---

#### GET /api/events/:id

取得單一活動詳細資訊，含可購買的商品列表（isAvailable = true）。不需登入。

**Response 200**

```json
{
  "id": 1,
  "title": "野人舒食團購",
  "status": "OPEN",
  "orderDeadline": "2026-04-10T12:00:00.000Z",
  "organizer": { "id": 1, "displayName": "王小明" },
  "products": [
    { "id": 1, "name": "雞胸肉-原味", "price": 8000, "isAvailable": true }
  ]
}
```

**Errors**

- `404` Event not found

---

#### PATCH /api/events/:id

編輯活動基本資訊。需登入，限發起人或管理員。

**Request Body**（所有欄位選填）

```json
{
  "title": "更新後的標題",
  "description": "更新後的說明",
  "orderDeadline": "2026-04-10T12:00:00.000Z",
  "pickupTime": "2026-04-11T12:00:00.000Z",
  "paymentInfo": "更新後的付款資訊"
}
```

**Response 200** 回傳更新後的活動。

**Errors**

- `403` Forbidden
- `404` Event not found

---

#### PATCH /api/events/:id/status

變更活動狀態。需登入，限發起人或管理員。

**Request Body**

```json
{
  "status": "CLOSED"
}
```

> status 可為 `OPEN` / `CLOSED` / `CANCELLED`

**Response 200** 回傳更新後的活動。

**Errors**

- `400` Invalid status
- `403` Forbidden
- `404` Event not found

---

#### DELETE /api/events/:id

刪除活動。需登入，限發起人或管理員。

**Response 204** No content.

**Errors**

- `403` Forbidden
- `404` Event not found

---

### Products

#### POST /api/events/:id/products

新增商品到活動。需登入，限發起人或管理員，活動須為 OPEN 狀態。

**Request Body**

```json
{
  "name": "雞腿排-原味",
  "price": 12000,
  "description": "去骨雞腿排"
}
```

**Response 201** 回傳建立的商品。

**Errors**

- `400` Missing required fields
- `403` Forbidden
- `404` Event not found

---

#### PATCH /api/events/:id/products/:pid

編輯商品或下架商品。需登入，限發起人或管理員，活動須為 OPEN 狀態。

**Request Body**（所有欄位選填）

```json
{
  "name": "更新名稱",
  "price": 9000,
  "description": "更新說明",
  "isAvailable": false
}
```

**Response 200** 回傳更新後的商品。

**Errors**

- `403` Forbidden
- `404` Event or product not found

---

### Orders

#### GET /api/events/:id/orders

取得活動的所有訂單。需登入，限發起人或管理員。

**Response 200** 回傳訂單列表，含參加者資訊與品項明細。

---

#### POST /api/events/:id/orders

建立訂單。需登入，活動須為 OPEN 狀態。

**Request Body**

```json
{
  "note": "不要太辣",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ]
}
```

**Response 201** 回傳建立的訂單。

**Errors**

- `400` Missing required fields / 商品不存在或已下架
- `404` Event not found

---

#### GET /api/events/:id/orders/me

取得我在這個活動的訂單。需登入。

**Response 200** 回傳訂單含品項明細。

**Errors**

- `404` Order not found

---

#### PATCH /api/events/:id/orders/:oid

修改訂單內容。需登入，限訂單本人，活動須為 OPEN 狀態。

**Request Body**

```json
{
  "note": "更新備註",
  "items": [{ "productId": 1, "quantity": 3 }]
}
```

**Response 200** 回傳更新後的訂單。

**Errors**

- `403` Forbidden
- `404` Order not found

---

#### PATCH /api/events/:id/orders/:oid/status

更新訂單付款或取貨狀態。需登入，限發起人或管理員。

**Request Body**

```json
{
  "paymentStatus": "PAID",
  "pickupStatus": "PICKED_UP"
}
```

> 兩個欄位皆為選填，至少填一個。

**Response 200** 回傳更新後的訂單。

**Errors**

- `403` Forbidden
- `404` Order not found

---

#### GET /api/events/:id/orders/export

匯出活動訂單為 CSV。需登入，限發起人或管理員。

**Response 200** Content-Type: text/csv，下載 CSV 檔案。

CSV 欄位：訂單 ID、參加者名稱、商品名稱、數量、單價、小計、付款狀態、取貨狀態、備註

---

### Templates

#### GET /api/templates

取得所有範本列表（含品項）。需登入。

**Response 200**

```json
[
  {
    "id": 1,
    "vendorName": "野人舒食",
    "description": "常用品項",
    "createdBy": { "id": 1, "displayName": "王小明" },
    "items": [{ "id": 1, "name": "雞胸肉-原味", "price": 8000 }]
  }
]
```

---

#### POST /api/templates

建立範本。需登入。

**Request Body**

```json
{
  "vendorName": "野人舒食",
  "description": "常用品項",
  "items": [
    { "name": "雞胸肉-原味", "price": 8000 },
    { "name": "雞胸肉-黑胡椒", "price": 8000 }
  ]
}
```

**Response 201** 回傳建立的範本。

**Errors**

- `400` Missing required fields

---

#### PATCH /api/templates/:id

編輯範本及品項。需登入。

**Request Body**（所有欄位選填）

```json
{
  "vendorName": "更新商家名稱",
  "description": "更新說明",
  "items": [
    { "id": 1, "name": "更新品項名稱", "price": 9000 },
    { "name": "新品項", "price": 5000 }
  ]
}
```

> items 中有 id 的為更新既有品項，沒有 id 的為新增品項。

**Response 200** 回傳更新後的範本。

**Errors**

- `404` Template not found

---

#### DELETE /api/templates/:id

刪除範本。需登入，限管理員。

**Response 204** No content.

**Errors**

- `403` Forbidden
- `404` Template not found

---

### Template Items

#### POST /api/templates/:id/items

新增品項到範本。需登入。

**Request Body**

```json
{
  "name": "新品項",
  "price": 8000,
  "description": "說明"
}
```

**Response 201** 回傳建立的品項。

**Errors**

- `400` Missing required fields
- `404` Template not found

---

#### PATCH /api/templates/:id/items/:iid

編輯範本品項。需登入。

**Request Body**（所有欄位選填）

```json
{
  "name": "更新名稱",
  "price": 9000,
  "description": "更新說明"
}
```

**Response 200** 回傳更新後的品項。

**Errors**

- `404` Template or item not found

---

#### DELETE /api/templates/:id/items/:iid

刪除範本品項。需登入。

**Response 204** No content.

**Errors**

- `404` Template or item not found

---

## Session

使用 `express-session`，session 儲存於記憶體（開發環境）。

Cookie 名稱：`connect.sid`

Session 內容：

```typescript
{
  userId: number;
  isAdmin: boolean;
}
```

---

## 實作進度

- [x] Auth（register, login, logout, me）
- [x] Events（getEvents, getEventById, createEvent, updateEvent, updateEventStatus, deleteEvent）
- [x] Products
- [ ] Orders
- [ ] Templates
- [ ] Template Items

---

## TODO

詳見 `TODO.md`。
