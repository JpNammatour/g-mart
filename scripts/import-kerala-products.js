// Script to import Kerala products into your Grameen Mart application
import { allKeralaProducts } from "../data/kerala-products.js"

console.log("🌿 Kerala Products Database")
console.log("==========================")
console.log(`Total Products: ${allKeralaProducts.length}`)

const vegetables = allKeralaProducts.filter((p) => p.category === "vegetable")
const fruits = allKeralaProducts.filter((p) => p.category === "fruit")

console.log(`🥬 Vegetables: ${vegetables.length}`)
console.log(`🍎 Fruits: ${fruits.length}`)

console.log("\n📊 Price Range Analysis:")
console.log("------------------------")

const priceRanges = {
  "Under ₹50": allKeralaProducts.filter((p) => p.price < 50).length,
  "₹50-₹100": allKeralaProducts.filter((p) => p.price >= 50 && p.price < 100).length,
  "₹100-₹200": allKeralaProducts.filter((p) => p.price >= 100 && p.price < 200).length,
  "Above ₹200": allKeralaProducts.filter((p) => p.price >= 200).length,
}

Object.entries(priceRanges).forEach(([range, count]) => {
  console.log(`${range}: ${count} products`)
})

console.log("\n🏷️ Sample Products:")
console.log("-------------------")

// Show sample vegetables
console.log("\n🥬 Sample Vegetables:")
vegetables.slice(0, 5).forEach((product) => {
  console.log(`${product.name} (${product.malayalamName}) - ₹${product.price}/${product.unit}`)
})

// Show sample fruits
console.log("\n🍎 Sample Fruits:")
fruits.slice(0, 5).forEach((product) => {
  console.log(`${product.name} (${product.malayalamName}) - ₹${product.price}/${product.unit}`)
})

console.log("\n✅ Ready to import into Grameen Mart!")
console.log("Copy the products from kerala-products.ts to your application.")

// Export for localStorage
const exportData = {
  products: allKeralaProducts,
  lastUpdated: new Date().toISOString(),
  source: "Kerala Markets Database",
}

console.log("\n📦 Export Data Ready:")
console.log(JSON.stringify(exportData, null, 2))
