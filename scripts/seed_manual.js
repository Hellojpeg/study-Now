const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://blessed-salamander-357.convex.cloud");

async function main() {
  console.log("Seeding teacher...");
  
  const args = {
      email: "jpgmoezmedia@gmail.com",
      password: "Cathalina1",
      name: "Mr. Gomez"
  };

  try {
    console.log("Attempting call to 'functions/seed:seedTeacher'...");
    await client.action("functions/seed:seedTeacher", args);
    console.log("Success with functions/seed:seedTeacher");
    return;
  } catch (e) {
    console.error("Failed functions/seed:seedTeacher:", e.message);
  }

  try {
    console.log("Attempting call to 'seed:seedTeacher'...");
    await client.action("seed:seedTeacher", args);
    console.log("Success with seed:seedTeacher");
    return;
  } catch (e) {
    console.error("Failed seed:seedTeacher:", e.message);
  }
}

main().catch(console.error);
