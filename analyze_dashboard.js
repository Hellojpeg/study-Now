const fs = require('fs');
const content = fs.readFileSync('/workspaces/study-Now/src/components/DashboardView.tsx', 'utf8');
// Check exact current DashboardView.tsx to build replace string.
console.log(content.substring(0, 500));
console.log("----");
console.log(content.substring(content.indexOf("export default DashboardView")));
