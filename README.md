# teachable-machine

這是一個純前端材質辨識系統範例，使用瀏覽器攝影機搭配 Teachable Machine 模型進行即時辨識。

## 使用方式

1. 進入專案目錄：
   ```bash
   cd /workspaces/teachable-machine
   ```
2. 啟動本機靜態伺服器（例如 Python）：
   ```bash
   python3 -m http.server 8000 --bind 0.0.0.0
   ```
3. 在瀏覽器打開：
   ```text
   http://localhost:8000
   ```
4. 如果你在 Codespaces / Dev Container 中，請確認 `8000` port 已轉送。
5. 按下「啟動攝影機」，允許瀏覽器存取攝影機。

## 專案內容

- `index.html`：前端使用介面
- `style.css`：頁面樣式
- `app.js`：模型載入、攝影機與辨識邏輯
- `models/`：Teachable Machine 模型資料

## 模型標籤

- plastic
- papper
- metal
- cardboard
- cloths

> 若需要改用其他 Teachable Machine 模型，可將新的 `model.json` 和 `metadata.json` 放進 `models/` 資料夾，並保持相同結構。
