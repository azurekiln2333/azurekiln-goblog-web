# azurekiln-goblog-web

## 简体中文

### 项目定位

这是整理后的 GoBlog 前端目录，来源以当前较新的 `web` 实现为基线，参考 `azurekiln-goblog-web-design` 的 Precision Editorial 风格，并对齐 `GoBlog-StarDreamerCyberNook-New` 后端实际注册的 `/api` 路由。

当前前端使用 Vue 3、Vite、Pinia、Axios、Tailwind CSS。所有请求统一经过 `src/utils/request.js`，会显示顶部加载条、右上角请求处理中提示、成功/失败 Toast。文章发布、后台用户角色保存等关键写操作也有局部按钮禁用、旋转加载和错误提示。

### 目录说明

- `src/api/`: 后端接口封装，按后端模块拆分。
- `src/components/common/AppFeedback.vue`: 全局请求加载与通知反馈。
- `src/stores/ui.js`: 全局 UI 状态与 Toast 队列。
- `src/views/`: 前台、用户中心、管理后台页面。
- `tailwind.config.js`: Tailwind 主题配置，延续设计 demo 的蓝灰、玻璃感、低边框风格。
- `dist/`: 构建产物目录，已加入 `.gitignore`。

### 运行

```bash
npm install
npm run dev
```

开发环境默认读取 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8088/api
```

如果后端运行在其他端口，修改这个变量即可。

### 构建

```bash
npm run build
```

构建产物输出到当前项目的 `dist/`。旧前端曾输出到 `../GoBlog-StarDreamerCyberNook-main/static`，现在已经解耦，避免新前端构建时污染旧后端目录。

### 后端接口覆盖

已封装并在页面中使用或预留功能入口的接口：

- 认证与用户：`POST /user/login`、`POST /user/email`、`POST /user/send_email`、`DELETE /user/logout`、`GET /user/detail`、`GET /user/info/:id`、`GET /user/loginlog`、`PUT /user/resetEmail`、`PUT /user/update`、`PUT /user/admin/update`、`POST /user/token`、`GET /user/list`
- 关注：`GET /user/follow/list`、`GET /user/follower/list`、`POST /user/follow`、`POST /user/follow/unfollow`
- 站点：`GET /site/:name`、`GET /site/qq_login`
- 消息：`GET /msg/conf`、`POST /msg/conf/update`、`GET /msg/check`、`POST /msg/clear`、`GET /msg`、`DELETE /msg`
- 文章：`POST /article`、`PUT /article`、`PUT /article/inc`、`GET /article`、`GET /article/search`、`GET /article/:id`、`POST /article/top/:id`、`DELETE /article/top`、`DELETE /article/admingTop`、`GET /article/review`、`POST /article/review/:id`、`POST /article/look`、`POST /article/digg/:id`、`DELETE /article`、`DELETE /article/admin`、`GET /article/history`、`DELETE /article/history`
- 分类与收藏：`POST /article/category`、`GET /article/category`、`DELETE /article/category`、`POST /article/collect`、`GET /article/collect/folder`、`GET /article/collect/list`、`POST /article/collect/folder`、`PUT /article/collect/folder`、`DELETE /article/collect/folder`
- 评论：`POST /comment`、`DELETE /comment/:id`、`GET /comment`、`GET /commentChild`、`POST /comment/digg/:id`
- 图片：`GET /image`、`POST /image`、`GET /images`、`DELETE /image`
- 轮播图：`GET /banner`、`POST /banner`、`PUT /banner/:id`、`DELETE /banner`
- 友链与推广：`GET /friendLink`、`POST /friendLink`、`PUT /friendLink/:id`、`DELETE /friendLink`、`GET /friendPromotion`、`POST /friendPromotion`、`PUT /friendPromotion/:id`、`DELETE /friendPromotion`
- 日志：`GET /logs`、`GET /logs/:id`、`DELETE /logs`
- 聊天与 AI：`POST /chat/send`、`GET /chat/get`、`GET /chat/session`、`POST /chat`
- 其他：`GET /captcha`、`GET /heartbeat`

### 已知后端限制

- `PUT /site/:name` 在 `GoBlog-StarDreamerCyberNook-New/router/site_router.go` 中被注释，当前没有实际暴露。因此前端站点设置页保持只读，不发送保存请求。
- `GET /user/friend/check` 在路由文件中有注册行，但没有绑定处理函数，前端暂不把它作为关键流程依赖。
- `UpdatePasswordView` 后端方法存在，但没有路由注册，前端不暴露修改密码请求。
- `GET /banner` 后端当前只查询 `isShow=true` 的轮播图，后台隐藏轮播图后该项会从列表中消失，不能通过同一列表重新显示。
- `GET /friendLink` 和 `GET /friendPromotion` 后端当前只查询 `is_show=true` 的记录，隐藏友链或推广后该项会从后台列表中消失。
- `POST /msg/conf/update` 后端当前实现会在绑定请求体后重新查询同名变量，可能覆盖请求中的新值；前端已提供设置入口和失败回滚，但实际保存效果取决于后端修正。
- `GET /user/follower/list` 后端当前实现疑似仍按 `user_id` 查询，可能返回关注列表而非真实粉丝列表；前端已提供兼容展示，但数据准确性取决于后端修正。
- `GET /article/history?userID=...` 支持公开浏览记录查询，但 `PUT /user/update` 和 `GET /user/detail` 当前没有暴露 `openHistory` 开关，前端只能展示后端已允许公开的足迹。
- `TestRouter` 只在 debug 模式注册，前端不作为正式功能覆盖。

## 繁體中文

### 專案定位

這是整理後的 GoBlog 前端目錄，以目前較新的 `web` 實作為基線，參考 `azurekiln-goblog-web-design` 的 Precision Editorial 風格，並對齊 `GoBlog-StarDreamerCyberNook-New` 後端實際註冊的 `/api` 路由。

前端使用 Vue 3、Vite、Pinia、Axios、Tailwind CSS。所有請求都會經過 `src/utils/request.js`，並顯示頂部載入條、右上角處理中提示、成功/失敗 Toast。文章發布與後台管理等寫入操作也加入了按鈕禁用、旋轉載入與錯誤提示。

### 執行

```bash
npm install
npm run dev
```

開發環境預設 API：

```env
VITE_API_BASE_URL=http://localhost:8088/api
```

### 建置

```bash
npm run build
```

建置輸出到 `dist/`，不再寫入舊後端的 `static` 目錄。

### 後端介面覆蓋

已封裝並在頁面中使用或保留功能入口的介面：

- 認證與使用者：`POST /user/login`、`POST /user/email`、`POST /user/send_email`、`DELETE /user/logout`、`GET /user/detail`、`GET /user/info/:id`、`GET /user/loginlog`、`PUT /user/resetEmail`、`PUT /user/update`、`PUT /user/admin/update`、`POST /user/token`、`GET /user/list`
- 關注：`GET /user/follow/list`、`GET /user/follower/list`、`POST /user/follow`、`POST /user/follow/unfollow`
- 站點：`GET /site/:name`、`GET /site/qq_login`
- 訊息：`GET /msg/conf`、`POST /msg/conf/update`、`GET /msg/check`、`POST /msg/clear`、`GET /msg`、`DELETE /msg`
- 文章：`POST /article`、`PUT /article`、`PUT /article/inc`、`GET /article`、`GET /article/search`、`GET /article/:id`、`POST /article/top/:id`、`DELETE /article/top`、`DELETE /article/admingTop`、`GET /article/review`、`POST /article/review/:id`、`POST /article/look`、`POST /article/digg/:id`、`DELETE /article`、`DELETE /article/admin`、`GET /article/history`、`DELETE /article/history`
- 分類與收藏：`POST /article/category`、`GET /article/category`、`DELETE /article/category`、`POST /article/collect`、`GET /article/collect/folder`、`GET /article/collect/list`、`POST /article/collect/folder`、`PUT /article/collect/folder`、`DELETE /article/collect/folder`
- 評論：`POST /comment`、`DELETE /comment/:id`、`GET /comment`、`GET /commentChild`、`POST /comment/digg/:id`
- 圖片：`GET /image`、`POST /image`、`GET /images`、`DELETE /image`
- 輪播圖：`GET /banner`、`POST /banner`、`PUT /banner/:id`、`DELETE /banner`
- 友鏈與推廣：`GET /friendLink`、`POST /friendLink`、`PUT /friendLink/:id`、`DELETE /friendLink`、`GET /friendPromotion`、`POST /friendPromotion`、`PUT /friendPromotion/:id`、`DELETE /friendPromotion`
- 日誌：`GET /logs`、`GET /logs/:id`、`DELETE /logs`
- 聊天與 AI：`POST /chat/send`、`GET /chat/get`、`GET /chat/session`、`POST /chat`
- 其他：`GET /captcha`、`GET /heartbeat`

### 後端限制

- 站點設定更新路由目前未註冊，因此相關頁面只讀。
- `GET /user/friend/check` 沒有處理函式，暫不依賴。
- 修改密碼方法存在於後端程式碼，但沒有路由註冊，前端不暴露。
- `GET /banner` 目前只回傳 `isShow=true` 的輪播圖，隱藏後不會再出現在同一列表中。
- `GET /friendLink` 與 `GET /friendPromotion` 目前只回傳 `is_show=true` 的記錄，隱藏後不會再出現在後台列表中。
- `POST /msg/conf/update` 目前後端可能在綁定請求後重新查詢並覆蓋新值；前端已提供設定入口與失敗回滾，實際保存效果需後端修正。
- `GET /user/follower/list` 目前後端疑似仍按 `user_id` 查詢，可能回傳關注列表而非真實粉絲列表；前端已做相容展示，資料準確性需後端修正。
- `GET /article/history?userID=...` 支援公開瀏覽記錄查詢，但 `PUT /user/update` 與 `GET /user/detail` 目前沒有暴露 `openHistory` 開關，前端只能展示後端已允許公開的足跡。

## English

### Purpose

This is the consolidated GoBlog frontend. It uses the newer `web` implementation as the baseline, follows the Precision Editorial design direction from `azurekiln-goblog-web-design`, and aligns with the `/api` routes actually registered by `GoBlog-StarDreamerCyberNook-New`.

The stack is Vue 3, Vite, Pinia, Axios, and Tailwind CSS. Every request goes through `src/utils/request.js` and receives visible UI feedback: a top loading bar, an in-progress indicator, and success/error toasts. Critical write flows, including article publishing and admin role updates, also include local disabled states, spinners, and error messages.

### Development

```bash
npm install
npm run dev
```

Default development API:

```env
VITE_API_BASE_URL=http://localhost:8088/api
```

### Build

```bash
npm run build
```

Build output goes to `dist/`. The frontend no longer writes directly into the old backend `static` directory.

### Backend API Coverage

The following backend APIs are wrapped and used in pages or exposed through retained feature entry points:

- Authentication and users: `POST /user/login`, `POST /user/email`, `POST /user/send_email`, `DELETE /user/logout`, `GET /user/detail`, `GET /user/info/:id`, `GET /user/loginlog`, `PUT /user/resetEmail`, `PUT /user/update`, `PUT /user/admin/update`, `POST /user/token`, `GET /user/list`
- Follows: `GET /user/follow/list`, `GET /user/follower/list`, `POST /user/follow`, `POST /user/follow/unfollow`
- Site: `GET /site/:name`, `GET /site/qq_login`
- Messages: `GET /msg/conf`, `POST /msg/conf/update`, `GET /msg/check`, `POST /msg/clear`, `GET /msg`, `DELETE /msg`
- Articles: `POST /article`, `PUT /article`, `PUT /article/inc`, `GET /article`, `GET /article/search`, `GET /article/:id`, `POST /article/top/:id`, `DELETE /article/top`, `DELETE /article/admingTop`, `GET /article/review`, `POST /article/review/:id`, `POST /article/look`, `POST /article/digg/:id`, `DELETE /article`, `DELETE /article/admin`, `GET /article/history`, `DELETE /article/history`
- Categories and collections: `POST /article/category`, `GET /article/category`, `DELETE /article/category`, `POST /article/collect`, `GET /article/collect/folder`, `GET /article/collect/list`, `POST /article/collect/folder`, `PUT /article/collect/folder`, `DELETE /article/collect/folder`
- Comments: `POST /comment`, `DELETE /comment/:id`, `GET /comment`, `GET /commentChild`, `POST /comment/digg/:id`
- Images: `GET /image`, `POST /image`, `GET /images`, `DELETE /image`
- Banners: `GET /banner`, `POST /banner`, `PUT /banner/:id`, `DELETE /banner`
- Friend links and promotions: `GET /friendLink`, `POST /friendLink`, `PUT /friendLink/:id`, `DELETE /friendLink`, `GET /friendPromotion`, `POST /friendPromotion`, `PUT /friendPromotion/:id`, `DELETE /friendPromotion`
- Logs: `GET /logs`, `GET /logs/:id`, `DELETE /logs`
- Chat and AI: `POST /chat/send`, `GET /chat/get`, `GET /chat/session`, `POST /chat`
- Other: `GET /captcha`, `GET /heartbeat`

### Backend Notes

- Site configuration updates are read-only in the UI because the backend update route is not registered.
- `GET /user/friend/check` appears in the router file without a handler and is not used as a required frontend flow.
- The password update handler exists in backend code but has no registered route, so the frontend does not expose it.
- `GET /banner` currently returns only banners with `isShow=true`, so hidden banners disappear from the same admin list.
- `GET /friendLink` and `GET /friendPromotion` currently return only records with `is_show=true`, so hidden items disappear from the admin list.
- `POST /msg/conf/update` may overwrite submitted values by re-querying into the same backend variable after binding. The UI includes settings and failure rollback, but persistence depends on a backend fix.
- `GET /user/follower/list` appears to query by `user_id`, so it may return following records instead of true followers. The UI renders it defensively, but data accuracy depends on a backend fix.
- `GET /article/history?userID=...` supports public browsing-history queries, but `PUT /user/update` and `GET /user/detail` do not currently expose the `openHistory` switch. The frontend can only display history that the backend already allows.
