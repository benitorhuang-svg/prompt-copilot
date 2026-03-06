# 規格驅動開發文件 (SDD) - AI Prompt Copilot

## 1. 概述 (Overview)
**專案名稱**: AI Prompt Copilot V1 Pro
**類型**: 單頁應用程式 (Single Page Application, SPA)
**目的**: 一個協助使用者生成結構化 AI Prompt 的工具，透過選擇模組庫中的範本並自訂參數來完成。
**技術棧**:
-   **前端**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla ES6+)。
-   **部署**: 單一靜態檔案 ([AI_Prompt_Copilot.html](file:///c:/Users/benit/Desktop/AI_Prompt_Copilot/AI_Prompt_Copilot.html))。
-   **資料來源**: 外部 JSON 檔案 (託管於 GitHub Gist)。

## 2. 系統架構 (Architecture)
本應用程式為一個獨立的 HTML 檔案，從遠端 JSON 來源載入設定與範本資料。使用瀏覽器的 Local Storage 來持久化使用者的偏好設定（語言、主題、上次選擇的模組庫）。

### 2.1 檔案結構
-   [AI_Prompt_Copilot.html](file:///c:/Users/benit/Desktop/AI_Prompt_Copilot/AI_Prompt_Copilot.html): 包含結構 (HTML)、樣式 (CSS) 與邏輯 (JS)。
-   `master_index.json` (遠端): 定義可用的模組庫清單。
-   `library_index.json` (遠端): 定義特定模組庫中的角色 (Roles)、任務 (Tasks) 與範本 (Templates)。

## 3. UI/UX 規格 (UI/UX Specification)

### 3.1 佈局 (Layout)
應用程式使用 **網格佈局 (Grid Layout)**，包含一個 **頁首 (Header)** 與一個 **三欄式主區域**。

#### 3.1.1 頁首 (Header)
-   **樣式**: 深色背景搭配漸層 (`var(--header-gradient)`)。
-   **元素**:
    1.  **品牌識別**: "Prompt Copilot V1 Pro"。
    2.  **搜尋欄**:
        -   預設文字: 本地化 (如 "搜尋任務...")。
        -   寬度: 固定 200px。
        -   功能: 過濾左側欄的任務清單。
    3.  **工具區** (靠右對齊，不換行):
        -   **連線狀態**: 指示燈 (綠/紅) + 文字。
        -   **重新整理**: 重新載入遠端資料。
        -   **主題切換**: 切換亮色/深色模式。
        -   **語言切換**: 切換 英文 / 繁體中文。
        -   **模式選擇**: 下拉選單，用於切換 Prompt 前綴 (例如：預設 vs 純代碼)。

#### 3.1.2 主網格 (Main Grid)
-   **欄位寬度**:
    1.  **導航 (左側)**: 寬度 `350px`。
    2.  **參數 (中間)**: 寬度 `1fr` (彈性空間)。
    3.  **結果 (右側)**: 寬度 `450px`。

### 3.2 元件 (Components)

#### 3.2.1 左側欄 (導航 Navigation)
-   **模組庫選擇器**: 下拉選單，選擇資料來源。
-   **類別選擇器**: 下拉選單，依角色/類別過濾任務。
-   **任務清單**:
    -   可捲動的任務範本清單。
    -   選取項目會高亮顯示。
    -   可透過頁首搜尋欄進行過濾。

#### 3.2.2 中間欄 (參數 Parameters)
-   **動態輸入區**:
    -   為所選範本的每個變數渲染一個 **手風琴 (Accordion)** 元件。
    -   **手風琴標題**: 顯示變數標籤與目前摘要值。
    -   **手風琴內容**:
        -   **文字輸入框**: 用於簡單字串變數。
        -   **下拉選單**: 用於單選變數 (定義為陣列時)。
        -   **多選標籤 (Multi-Select Chips)**: 用於結尾為 `__multi` 或 `__single` 的變數。支援互斥選擇邏輯 (例如選擇 "None" 會清除其他選項)。

#### 3.2.3 右側欄 (結果 Result)
-   **複製按鈕** (頂部):
    -   全寬按鈕。
    -   背景色: 淺綠色 (`#4ade80`)。
    -   動作: 將內容複製到剪貼簿並顯示 "已複製!" 回饋。
-   **文字區域** (底部):
    -   顯示最終生成的 Prompt。
    -   唯讀 (或可由使用者編輯，但會被動態更新覆寫)。
    -   字型: 等寬字型 (`JetBrains Mono`)。

### 3.3 主題設定 (Theming)
-   **變數**: CSS 變數定義了 `bg-body`, `bg-card`, `text-main`, `border` 等顏色。
-   **模式**:
    -   `light`: 亮色背景，深色文字。
    -   `dark`: 深色背景，亮色文字。
    -   **頁首**: 始終維持深色主題。

## 4. 資料規格 (Data Specification)

### 4.1 資料模型 (Data Models)

#### 4.1.1 模組庫索引 (State `libraries`)
模組庫名稱對應到 URL 的映射表。
```json
{
  "模組庫名稱 1": "https://url.to/json",
  "模組庫名稱 2": "https://url.to/json"
}
```

#### 4.1.2 模組庫資料 (State `rolesData`)
角色/類別對應到任務的映射表。
```json
{
  "類別名稱": {
    "任務名稱": {
      "template": "Prompt 範本內容，包含 {var1} 和 {var2}...",
      "vars": {
        "var1": "預設值",
        "var2": ["選項 A", "選項 B"],
        "var3__multi": ["選項 1", "選項 2"]
      }
    }
  }
}
```

#### 4.1.3 內部狀態 (Internal State)
```javascript
state = {
    lang: 'zh' | 'en',
    theme: 'light' | 'dark',
    libraries: {},      // 已載入的模組庫清單
    rolesData: {},      // 目前模組庫的任務資料
    selectedLib: '',    // 目前選擇的模組庫 Key
    selectedRole: '',   // 目前選擇的角色 Key
    selectedTask: '',   // 目前選擇的任務 Key
    vars: {},           // 範本變數的當前值
    modePrefix: ''      // 來自模式選擇的前綴字串
}
```

## 5. 功能規格 (Functional Specification)

### 5.1 初始化 ([init](file:///c:/Users/benit/Desktop/AI_Prompt_Copilot/AI_Prompt_Copilot.html#695-710))
1.  套用儲存的主題 (Theme)。
2.  設定語言 (更新靜態 UI 字串)。
3.  綁定事件監聽器 (輸入框、按鈕)。
4.  載入主索引 ([loadMasterIndex](file:///c:/Users/benit/Desktop/AI_Prompt_Copilot/AI_Prompt_Copilot.html#737-757))。

### 5.2 資料載入
1.  取得 `INDEX_URLS[lang]`。
2.  填充模組庫選擇器。
3.  取得所選模組庫的 URL。
4.  填充類別選擇器。
5.  渲染任務清單。

### 5.3 互動邏輯
-   **選擇任務**:
    -   更新 `selectedTask`。
    -   觸發 [renderDynamicInputs](file:///c:/Users/benit/Desktop/AI_Prompt_Copilot/AI_Prompt_Copilot.html#811-893) (渲染動態輸入區)。
-   **更新參數**:
    -   使用者變更輸入/選擇/標籤。
    -   更新 `state.vars[key]`。
    -   觸發 [updateResult](file:///c:/Users/benit/Desktop/AI_Prompt_Copilot/AI_Prompt_Copilot.html#894-902) (更新結果區)。
-   **搜尋**:
    -   根據輸入內容過濾 `任務清單` 項目名稱。

### 5.4 Prompt 生成
-   **邏輯**:
    -   取得目前任務的 `template` 字串。
    -   使用 `state.vars` 中的值替換 `{key}` 佔位符。
    -   在開頭加上 `state.modePrefix`。
    -   輸出至結果文字區域。

### 5.5 本地化 (Localization)
-   **UI 字典**: `UI` 物件包含靜態標籤字串 (導航、複製按鈕、狀態等)。
-   **動態資料**: 根據 'zh' 或 'en' 使用不同的 JSON URL。

## 6. CSS 規格
-   **全域字型**: `Inter`, `sans-serif`。
-   **等寬字型**: `JetBrains Mono`。
-   **主要顏色**: `#3b82f6` (藍色) - *註: 複製按鈕覆寫為 #4ade80*。
-   **圓角**: 一般為 `8px` - `12px`。
