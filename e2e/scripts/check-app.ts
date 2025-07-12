import { config } from "../src/config/env.config";

async function checkApplication() {
  const baseUrl = config.browser.baseUrl;
  console.log(
    `🔍 Checking if Money Keeper application is running at ${baseUrl}`
  );

  try {
    const response = await fetch(baseUrl);
    if (response.ok) {
      console.log("✅ Application is running and accessible");
      process.exit(0);
    } else {
      console.log(`❌ Application returned status: ${response.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(
      `❌ Cannot connect to application: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    console.log(
      `💡 Make sure the Money Keeper application is running at ${baseUrl}`
    );
    console.log(
      `💡 You can start it with: npm start (in the frontend directory)`
    );
    process.exit(1);
  }
}

checkApplication();
