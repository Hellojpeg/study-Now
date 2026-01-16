// scripts/create_teacher.js
// Usage: set CONVEX_ADMIN_KEY, optionally TEACHER_EMAIL, TEACHER_PASSWORD, TEACHER_NAME then run:
//   CONVEX_ADMIN_KEY=your_admin_key TEACHER_EMAIL=jpgmoezmedia@gmail.com TEACHER_PASSWORD=Cathalina1 node scripts/create_teacher.js

const { spawnSync } = require("child_process");

const adminKey = process.env.CONVEX_ADMIN_KEY;
if (!adminKey) {
  console.error("ERROR: Please set CONVEX_ADMIN_KEY in the environment.");
  process.exit(1);
}

const email = process.env.TEACHER_EMAIL || "jpgmoezmedia@gmail.com";
const password = process.env.TEACHER_PASSWORD; // require it explicitly
if (!password) {
  console.error("ERROR: Please set TEACHER_PASSWORD in the environment (do not hard-code it in files). Example: TEACHER_PASSWORD=Cathalina1");
  process.exit(1);
}
const name = process.env.TEACHER_NAME || "Teacher";

// Build args for the convex CLI call
const argsObj = { email, password, name };
const argsJson = JSON.stringify(argsObj);

console.log("Calling: npx convex call seedTeacher --args", argsJson);

// We pass CONVEX_ADMIN_KEY to the subprocess env so convex CLI can use it
const env = Object.assign({}, process.env, { CONVEX_ADMIN_KEY: adminKey });

const res = spawnSync("npx", ["convex", "call", "seedTeacher", "--args", argsJson], {
  stdio: "inherit",
  env,
});

if (res.error) {
  console.error("Spawn error:", res.error);
  process.exit(1);
}
process.exit(res.status || 0);
