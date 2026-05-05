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
- [x] 嚴重度分類：Critical / Major / Minor
- [x] 狀態流轉：Open → In Progress → Closed
- [x] 列表篩選（依 status / severity）
- [x] 健康檢查 endpoint（含資料庫連線驗證）
- [x] 前端介面：列表頁、詳情頁、新增 / 編輯表單（共用元件）
- [x] axios 串接後端 API（含 loading / error / 404 友善處理）
- [x] 客戶端表單驗證 + 後端驗證錯誤回顯
- [x] 環境變數設定（前後端 `.env` 分離，有 `.env.example` 範本）

**規劃中 🛠**

- [ ] Jest + Supertest API 自動化測試
- [ ] Cypress E2E 自動化測試
- [ ] 部署上線（Vercel + Render）
- [ ] 一分鐘 Demo 影片

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

- 前端網址：（部署後填）
- 後端 API：（部署後填）

> ⚠️ 後端使用 Render 免費方案，閒置 15 分鐘會休眠。第一次喚醒約需 30 秒，請耐心等候。

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

（待 Week 3 完成後補上 — 預計用 Jest + Supertest 測 API、Cypress 測關鍵 E2E 流程）

## 👤 作者

小加（Michelle） — [GitHub @Jen041794](https://github.com/Jen041794)
