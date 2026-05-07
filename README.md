# 🐛 Bug Tracker

> 全端缺陷追蹤系統 — React + Node.js + PostgreSQL

## 📖 專案介紹

以 QA 工作流程為主軸的全端缺陷追蹤系統，用來實際操作 **Bug 的回報、指派、狀態流轉與嚴重度分類**。比起一般的 todo list，這個專案更貼近真實 QA / 開發協作場景，能展示對缺陷管理生命週期的理解。

技術上完整實作前後端串接、資料庫設計、RESTful API、自動化測試與雲端部署，作為求職作品集呈現全端開發能力。

## 🛠 技術棧

| 層 | 技術 |
|---|---|
| 前端 | React.js + Bootstrap + Vite |
| 後端 | Node.js + Express + Prisma ORM |
| 資料庫 | PostgreSQL |
| 自動化測試 | Jest + Supertest（API）、Cypress（E2E） |
| 部署 | Vercel（前端）+ Render（後端 + DB） |

## ✨ 主要功能

**已完成 ✅**

- [x] Bug 的 CRUD：建立 / 查詢 / 更新 / 刪除
- [x] 嚴重度分類：緊急 / 一般 / 低（Critical / Major / Minor）
- [x] 狀態流轉：待處理 → 處理中 → 已關閉
- [x] 列表篩選（依 status / severity）
- [x] 健康檢查 endpoint（含資料庫連線驗證）
- [x] 前端介面：列表頁、詳情頁、新增 / 編輯表單（共用元件）
- [x] 表單描述拆「問題現況 / 預期情況」兩欄（QA 友善格式）
- [x] axios 串接後端 API（含 loading / error / 404 友善處理）
- [x] 客戶端表單驗證 + 後端驗證錯誤回顯
- [x] 環境變數設定（前後端 `.env` 分離，有 `.env.example` 範本）
- [x] 部署上線（Vercel + Render，CORS 白名單已鎖）
- [x] Jest + Supertest API 自動化測試（7 個案例蓋健康檢查 + CRUD + 必填驗證 + 404）
- [x] Cypress E2E 自動化測試（3 個案例蓋建立 / 刪除 / 篩選 + 編輯狀態流程）

**規劃中 🛠**

- [ ] 一分鐘 Demo 影片
- [ ] 圖片上傳（讓 Bug 報告可以附截圖）

## 📡 API Endpoints

| Method | Path | 說明 |
|--------|------|------|
| `GET` | `/health` | 健康檢查（含 DB 連線驗證） |
| `GET` | `/api/bugs` | 取得 Bug 列表，支援 `?status=&severity=` 篩選 |
| `GET` | `/api/bugs/:id` | 取得單筆 Bug |
| `POST` | `/api/bugs` | 建立新 Bug |
| `PATCH` | `/api/bugs/:id` | 部分更新 Bug |
| `DELETE` | `/api/bugs/:id` | 刪除 Bug |

**Bug 資料模型：**

```javascript
{
  id          // UUID（自動產生）
  title       // 必填，最多 200 字元
  description // 可選
  severity    // 必填：CRITICAL | MAJOR | MINOR
  status      // 預設 OPEN：OPEN | IN_PROGRESS | CLOSED
  reporter    // 必填，回報者
  assignee    // 可選，指派對象
  createdAt   // 自動填入
  updatedAt   // 自動更新
}
```

## 🚀 線上 Demo

- 前端網址：https://bug-tracker-weld.vercel.app
- 後端健康檢查：https://bug-tracker-api-obiu.onrender.com/health

> ⚠️ 後端使用 Render 免費方案，閒置 15 分鐘會休眠。第一次喚醒約需 30 秒，請耐心等候。

## 🎬 Demo 影片

_coming soon — 1 分鐘走過列表 / 新增 / 詳情 / 編輯狀態 / 刪除完整流程_

## 📁 專案結構

```
bug-tracker/
├── backend/         Express + Prisma + PostgreSQL
│   ├── src/
│   │   ├── app.js     Express app（給 Jest 用）
│   │   ├── index.js   啟動 server（dev / dev:e2e / start）
│   │   ├── routes/    Bug CRUD endpoints
│   │   └── lib/       共用 PrismaClient
│   ├── prisma/        Schema + migrations
│   ├── tests/         Jest + Supertest API 測試
│   └── scripts/       測試 DB schema 套用工具
├── frontend/        React + Vite + Bootstrap
│   ├── src/
│   │   ├── pages/     列表 / 詳情 / 表單頁
│   │   ├── lib/       axios instance
│   │   └── context/   Toast 通知
│   └── cypress/       E2E 測試（spec + custom commands）
└── README.md
```

## 💻 本地啟動

### 環境需求

- Node.js（建議 LTS 版本）
- PostgreSQL 14 以上

### 後端

```bash
# 1. 進入後端資料夾
cd backend

# 2. 安裝套件
npm install

# 3. 複製環境變數範本，填入自己的 PostgreSQL 連線資訊
cp .env.example .env

# 4. 在 PostgreSQL 建立資料庫
psql -U postgres -c "CREATE DATABASE bug_tracker;"

# 5. 跑 migration（建立資料表）
npx prisma migrate dev

# 6. 啟動開發伺服器（含熱重載）
npm run dev
```

伺服器啟動後，開瀏覽器或 Thunder Client 訪問 `http://localhost:3000/health`，看到 `{"status":"ok","database":"connected"}` 即代表成功。

### 前端

```bash
# 1. 進入前端資料夾
cd frontend

# 2. 安裝套件
npm install

# 3. 複製環境變數範本（預設指向 http://localhost:3000）
cp .env.example .env

# 4. 啟動開發伺服器
npm run dev
```

瀏覽器開 `http://localhost:5173`，應該看到 Bug 列表頁。

> ⚠️ 啟動順序：**先啟後端再啟前端**。前端會打 `VITE_API_URL`，若後端沒啟前端會顯示「載入失敗」（這是預期行為，不是 bug）。

### 同時跑前後端（推薦開兩個終端機）

| 終端 | 資料夾 | 指令 | Port |
|------|--------|------|------|
| 1 | `backend/` | `npm run dev` | 3000 |
| 2 | `frontend/` | `npm run dev` | 5173 |

## 🧪 自動化測試

後端 API 用 **Jest + Supertest** 跑整合測試，測試使用獨立的 `bug_tracker_test` 資料庫，跑前會清空 `bugs` 表，不會影響開發資料。

### 第一次設定

```bash
cd backend

# 1. 建測試 DB
psql -U postgres -c "CREATE DATABASE bug_tracker_test;"

# 2. 複製測試環境變數範本，把 YOUR_PASSWORD 換成自己的
cp .env.test.example .env.test

# 3. 套 schema 到測試 DB
npm run test:setup
```

### 跑測試

```bash
cd backend
npm test
```

預期 7 個案例全綠：

| 模組 | 測什麼 |
|---|---|
| `GET /health` | 服務存活 + DB 連得到 |
| `POST /api/bugs` | 必填欄位驗證 / 成功建立 |
| `GET /api/bugs` | 列表載入 / 依 severity 篩選 |
| `GET /api/bugs/:id` | 不存在的 id 回 404 |
| `PATCH /api/bugs/:id` | 部分更新成功 |
| `DELETE /api/bugs/:id` | 刪除後再查回 404 |

### E2E 測試（Cypress）

E2E 測試用 **Cypress** 跑完整使用者流程，包含 UI 互動 + API 串接。後端會切到測試 DB（`bug_tracker_test`，跟 Jest 共用），不污染開發資料。

#### 啟動三個終端機

| 終端 | 資料夾 | 指令 | 用途 |
|------|--------|------|------|
| 1 | `backend/` | `npm run dev:e2e` | 後端啟動，連 `bug_tracker_test` |
| 2 | `frontend/` | `npm run dev` | 前端 dev server |
| 3 | `frontend/` | `npx cypress open` 或 `npx cypress run` | Cypress GUI / headless |

#### 預期結果

3 個案例全綠（headless 模式約 4 秒）：

| Spec | 測什麼 |
|---|---|
| `create-bug.cy.js` | 列表 → 新增頁 → 填表 → 送出 → 列表能看到；種一筆 → 詳情頁 → 確認 → 刪除 → 列表消失 |
| `filter-and-edit.cy.js` | 種兩筆不同 status → 篩選 OPEN → 進詳情 → 改成 IN_PROGRESS → 列表回看「處理中」 |

> 💡 spec 全部用 `cy.intercept()` + `cy.wait('@alias')` 等 API 回應後再斷言，避開 Cypress 常見的 flaky 等待問題。

## 👤 作者

小加（Michelle） — [GitHub @Jen041794](https://github.com/Jen041794)
