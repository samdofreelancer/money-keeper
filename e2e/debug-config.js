const { config } = require("./src/config/env.config.ts");

console.log("🔍 Debug Configuration:");
console.log("BASE_URL from env:", process.env.BASE_URL);
console.log("Config browser.baseUrl:", config.browser.baseUrl);
console.log("Full browser config:", config.browser);
