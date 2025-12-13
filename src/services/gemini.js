import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 將 File 物件轉換為 Gemini API 需要的 Base64 格式
 */
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 輔助函式：等待指定豪秒數 (用於重試延遲)
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 定義模型優先順序清單
 * 1. 2.5 Flash: 最新、最強，但偶爾不穩定 (503)
 * 2. 2.0 Flash: 非常穩定，速度快
 * 3. Flash Latest: 通用別名，指向當前穩定的 Flash 版本
 */
const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest"
];

/**
 * 核心分析函式 (圖片版 - 包含備援機制)
 */
export async function analyzeImage(imageFile, apiKey) {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in settings.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 準備圖片 (只做一次)
  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `
    你是一位專業的營養師。請分析這張圖片中的食物。
    請回傳純 JSON 格式，不要 Markdown：
    {
      "is_food": true,
      "food_name": "食物名稱",
      "calories": 0,
      "protein": 0,
      "fat": 0,
      "carbs": 0,
      "advice": "簡短評語"
    }
  `;

  let lastError = null;

  // === 迴圈嘗試不同模型 ===
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`📡 [圖片分析] 嘗試連接模型: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // 發送請求
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ [圖片分析] 模型 ${modelName} 成功回應！`);

      // 解析 JSON
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanText);

      if (!data.is_food) throw new Error("無法辨識食物");
      return data; // 成功回傳

    } catch (error) {
      console.warn(`⚠️ 模型 ${modelName} 失敗:`, error.message);
      lastError = error;

      // 錯誤處理策略
      if (error.message.includes("503")) {
        console.log("伺服器忙碌，休息 1 秒後切換備用模型...");
        await wait(1000);
        continue; // 試下一個
      }
      if (error.message.includes("404") || error.message.includes("not found")) {
        continue; // 試下一個
      }
      // 如果是 Key 無效，直接中斷
      if (error.message.includes("400") || error.message.includes("API key")) {
        throw new Error("API Key 無效，請檢查設定。");
      }
    }
  }

  throw new Error(`圖片分析失敗 (所有模型皆無法連線): ${lastError?.message}`);
}

/**
 * 分析純文字描述 (文字版 - 包含備援機制)
 */
export async function analyzeText(text, apiKey) {
  if (!apiKey) throw new Error("API Key is missing.");

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
    你是一位專業營養師。請分析這段食物描述："${text}"。
    請估算其熱量與營養素，並回傳純 JSON 格式，不要 Markdown：
    {
      "is_food": true,
      "food_name": "食物名稱",
      "calories": 0,
      "protein": 0,
      "fat": 0,
      "carbs": 0,
      "advice": "簡短評語"
    }
    如果描述的不是食物，請將 is_food 設為 false。
  `;

  let lastError = null;

  // === 迴圈嘗試不同模型 (文字也需要備援) ===
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`📡 [文字分析] 嘗試連接模型: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log(`✅ [文字分析] 模型 ${modelName} 成功回應！`);

      const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanText);

      if (!data.is_food) throw new Error("這看起來不像食物描述，請再試一次。");
      return data;

    } catch (error) {
      console.warn(`⚠️ 模型 ${modelName} 失敗:`, error.message);
      lastError = error;

      if (error.message.includes("503")) {
        await wait(1000);
        continue;
      }
      if (error.message.includes("404") || error.message.includes("not found")) {
        continue;
      }
      if (error.message.includes("API key")) {
        throw new Error("API Key 無效。");
      }
    }
  }

  throw new Error(`文字分析失敗: ${lastError?.message}`);
}