# diet-rpg

graph TD
    User[使用者] -->|打開 App| PWA[Vue PWA 前端]
    
    subgraph "手機本地端 (Browser)"
        PWA -->|讀取/寫入| LocalDB[Local Storage / Pinia]
        LocalDB -->|儲存| API_Key[Gemini API Key]
        LocalDB -->|儲存| UserData[等級/經驗值/飲食紀錄]
    end
    
    subgraph "雲端服務"
        PWA -->|1. 傳送圖片 + Key| Gemini[Google Gemini API]
        Gemini -->|2. 回傳營養 JSON| PWA
        
        PWA -.->|3. (選用) 同步資料| UserSheet[使用者個人的 Google Sheet]
    end