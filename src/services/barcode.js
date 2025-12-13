// src/services/barcode.js
export async function fetchProductByBarcode(barcode) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const nutriments = p.nutriments || {};

      return {
        is_food: true,
        food_name: p.product_name || '未知商品',
        // 優先使用每份的數值，如果沒有則使用 100g 的數值
        calories: Math.round(nutriments['energy-kcal_serving'] || nutriments['energy-kcal_100g'] || 0),
        protein: Math.round(nutriments['proteins_serving'] || nutriments['proteins_100g'] || 0),
        fat: Math.round(nutriments['fat_serving'] || nutriments['fat_100g'] || 0),
        carbs: Math.round(nutriments['carbohydrates_serving'] || nutriments['carbohydrates_100g'] || 0),
        advice: "已透過條碼讀取營養標示，請確認份量。"
      };
    } else {
      throw new Error("找不到此條碼的商品資料");
    }
  } catch (error) {
    throw new Error("條碼查詢失敗: " + error.message);
  }
}
